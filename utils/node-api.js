const glob = require("glob");
const fs = require("fs");
const { exec } = require("node:child_process");
const shell = require("shelljs");
const { promisify } = require('util')
const os = require('os')
const utils = require(".");
/** 判断文件是否存在
 *
 * @param {*} filePath
 * @returns
 */
const fileIsExist = async (filePath) => {
  return await fs.promises
    .access(filePath)
    .then(() => true)
    .catch((_) => false);
};

/** 写入文件
 *
 * @param {*} path
 * @param {*} buffer
 * @returns
 */
const writeFileRecursive = function (path, buffer) {
  return new Promise((res, rej) => {
    let lastPath = path.substring(0, path.lastIndexOf("/"));
    fs.mkdir(lastPath, { recursive: true }, (err) => {
      if (err) return rej(err);
      fs.writeFile(path, buffer, function (err) {
        if (err) return rej(err);
        return res(null);
      });
    });
  });
};

/**
 * @param {string} command process to run
 * @param {string[]} args commandline arguments
 * @returns {Promise<void>} promise
 */
const runCommand = (command, args) => {
  const cp = require("child_process");
  return new Promise((resolve, reject) => {
    const executedCommand = cp.spawn(command, args, {
      stdio: "inherit",
      shell: true,
    });

    executedCommand.on("error", (error) => {
      reject(error);
    });

    executedCommand.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject();
      }
    });
  });
};
/** 获取指定目录下所有文件的导出信息
 * 
 * @param {*} dirPath 指定目录
 * @param {*} suffix 后缀
 * @param {*} opts：方法本身的配置对象  
 *          1. removeRequireCache 是否清除require缓存，在【应用启动过程中会修改源码】的场景下执行
 *          2. needAbsPath 是否挂载文件绝对路径信息再返回
 *          3. globOpts glob的配置对象
 * @returns 
 */
function getFileExportObjInDir(dirPath, suffix = "js", opts = {}) {
  let {
    removeRequireCache,
    needAbsPath,
    globOpts = {}
  } = opts
  // 利用glob实现自动引入所有命令实现
  const files = glob.sync(`${dirPath}/*.${suffix}`, {
    ...globOpts,
  });
  const controllers = {};
  files.forEach((key) => {
    const name = key.split("/").pop().replace(/\.js/g, "");
    if (removeRequireCache) {
      delete require.cache[key]
    }
    const value = require(key);
    // 挂载文件绝对路径信息
    if (needAbsPath) {
      value._absPath = key
    }
    controllers[name] = value;
  });
  return controllers;
}

/**
 * 获取当前操作系统
 * @returns 
 */
function getPlatForm() {
  const platform = os.platform()
  let isLinux, isMac, isWindows;
  switch (platform) {
    case 'darwin':
      isMac = true;
      break;
    case 'linux':
      isLinux = true;
      break;
    case 'win32':
      isWindows = true;
      break;
    default:

  }
  return {
    isLinux, isMac, isWindows
  }
}

/** 根据命令获取对应的包管理器
 * 
 * @param {*} command 
 * @returns 
 */
function getPackageManageByCommand(command) {
  let {
    isLinux, isMac, isWindows
  } = getPlatForm()
  if (!isMac) {
    throw new Error(`非mac平台请手动安装${command}命令`)
  }
  // w-todo 待实现添加系统判断
  let commandPackageMangeMap = {
    npm: ['live-server'],
    brew: ['tree']
  }
  let target = ''
  utils.eachObj(commandPackageMangeMap, (packageMange, commands) => {
    if (commands.includes(command)) {
      target = packageMange
    }
  })
  return target
}

module.exports = {
  fileIsExist,
  writeFileRecursive,
  shell,
  exec: promisify(exec),
  runCommand,
  getFileExportObjInDir,
  getPlatForm,
  getPackageManageByCommand
};
