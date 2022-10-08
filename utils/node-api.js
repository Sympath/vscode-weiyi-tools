const glob = require("glob");
const fs = require("fs");
const path = require("path");
const { exec } = require("node:child_process");
const shell = require("shelljs");
const { promisify } = require('util')
const os = require('os')
const utils = require(".");

const cd = function (cdPath) {
  let { isWindows } = getPlatForm()
  // 如果是window环境，可能出现/d:/xxx类情况，需要先切换盘符，再切换相对路径
  if (isWindows) {
    let [drive, sonPath] = cdPath.split(':');
    if (!sonPath) {
      // 如果只有一个值说明是相对路径 替换下
      sonPath = drive
    } else {
      shell.cd(drive)
      // 如果有两个值说明有盘符，第二个路径改为相对路径写法
      sonPath = sonPath.slice(1)
    }
    cdPath = sonPath
  }
  shell.cd(cdPath)
}
/** 判断文件是否存在
 *
 * @param {*} filePath
 * @returns Boolean
 */
const fileIsExist = async function (filePath) {
  return await fs.promises
    .access(filePath)
    .then(() => true)
    .catch((_) => false);
};

/** 写入文件
 * @param {*} path
 * @param {*} buffer
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
const runCommand = function (command, args) {
  return new Promise((resolve, reject) => {
    exec(`${command} ${args.join(' ')}`, {
      maxBuffer: 10000 * 1024,
    }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
};
/** 获取指定目录下所有文件的导出信息
 * 
 * @param {*} dirPath 指定目录 需要绝对路径
 * @param {*} suffix 后缀
 * @param {*} opts：方法本身的配置对象  
 *          1. removeRequireCache 是否清除require缓存，在【应用启动过程中会修改源码】的场景下执行
 *          2. needAbsPath 是否挂载文件绝对路径信息再返回
 *          3. globOpts glob的配置对象
 */
function getFileExportObjInDir(dirPath, suffix = "js", opts = {}) {
  let {
    removeRequireCache,
    needAbsPath = true,
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
/** 加载指定文件夹下指定后缀的文件路径列表 （不给exts参数时则获取所有类型文件）
 * @param {*} dirPath 
 * @param {*} names Array 文件名数组 []
 */
function loadPathByName(dirPath, names) {
  //  @return [[filePath, dirs = []]] 返回一个二维数组 第一个元素是文件地址；第二个是对应的信息对象 { resolveDirs 相对根路径的目录数组 dirPath 父路径 }
  let ignoreNames = ['node_modules']
  function loadPathByNameCore(dirPath, names, currentDir = []) {
    if (currentDir.length === 0) {
      // 取最后一个目录名作为初始目录
      currentDir = [dirPath.split('/').pop()]
    }
    let arrFiles = []  // 最终的结果
    let arrFile = [];
    // 1. 读取指定目录内的所有子文件
    const files = fs.readdirSync(dirPath)
    for (let i = 0; i < files.length; i++) {
      const item = files[i]
      // 2. 如果和指定名称匹配 则存入结果数组中
      if (names.includes(item)) {
        arrFile = [dirPath + '/' + item, {
          resolveDirs: JSON.parse(JSON.stringify(currentDir)),// 相对根路径的目录数组
          dirPath // 父路径
        }]
        arrFiles.push(arrFile)
      }
      // 3. 判断是否是文件夹，是则递归处理
      const stat = fs.lstatSync(dirPath + '/' + item)
      if (stat.isDirectory() === true && !ignoreNames.includes(item)) {
        currentDir.push(item)
        arrFiles.push(...loadPathByNameCore(dirPath + '/' + item, names, currentDir))
      }
    }
    currentDir.pop()
    return arrFiles
  }
  return loadPathByNameCore(dirPath, names)
}

/** 加载指定文件夹下指定后缀的文件路径列表 （不给exts参数时则获取所有类型文件）
 * @param {*} dirPath 
 * @param {*} exts Array 文件类型数组 [mp4]
 * @param {*} cb Function 可以在存入时对存入对象进行一层拦截处理
 * @return [[filePath, dirs = []]] 返回一个二维数组 第一个元素是文件地址；第二个是对应的子目录数组
 */
function loadFileNameByPath4Ext(dirPath, exts, cb = (item) => item) {
  function loadFileNameByPath4ExtCore(dirPath, exts, cb = (item) => item, currentDir = []) {
    if (currentDir.length === 0) {
      // 取最后一个目录名作为初始目录
      currentDir = [dirPath.split('/').pop()]
    }
    let arrFiles = []
    let arrFile = [];
    const files = fs.readdirSync(dirPath)
    for (let i = 0; i < files.length; i++) {
      const item = files[i]
      const stat = fs.lstatSync(dirPath + '/' + item)
      if (stat.isDirectory() === true) {
        currentDir.push(item)
        arrFiles.push(...loadFileNameByPath4Ext(dirPath + '/' + item, exts, cb, currentDir))
      } else {
        if (exts != undefined && exts != null && exts.length > 0) {
          for (let j = 0; j < exts.length; j++) {
            let ext = exts[j];
            if (item.split('.').pop().toLowerCase() == ext.trim().toLowerCase()) {
              arrFile = [dirPath + '/' + item, JSON.parse(JSON.stringify(currentDir))]
              let handlerItem = cb(arrFile)
              // 如果排除属性存在，则不做任何处理
              if (handlerItem.exclude) {

              } else {
                arrFiles.push(handlerItem)
              }
              break;
            }
          }
        } else {
          arrFile = [dirPath + '/' + item, JSON.parse(JSON.stringify(currentDir))]
          let handlerItem = cb(arrFile)
          // 如果排除属性存在，则不做任何处理
          if (handlerItem.exclude) {

          } else {
            arrFiles.push(handlerItem)
          }
        }
      }
    }
    currentDir.pop()
    return arrFiles
  }
  return loadFileNameByPath4ExtCore(dirPath, exts, cb, [])
}

/** 对exec进行一个简单的封装，返回的是一个Promise对象，便于处理。
 * @return Promise
 */
function doShellCmd(cmd) {
  let str = cmd;
  let result = {};

  return new Promise(function (resolve, reject) {
    try {
      exec(str, function (err, stdout, stderr) {
        if (err) {
          console.log('err');
          result.errCode = 500;
          result.data = "操作失败！请重试";
          result.stderr = stderr;
          reject(result);
        } else {
          console.log('stdout ', stdout);//标准输出
          result.errCode = 200;
          result.data = "操作成功！";
          result.stdout = stdout;
          resolve(result);
        }
      })
    } catch (error) {
      throw new Error(error)
    }

  })
}
/** 获取当前操作系统
 * @returns obj
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
    npm: ['live-server', 'qt', 'vue-chrome-cli'],
    brew: ['tree'],
  }
  let target = ''
  utils.eachObj(commandPackageMangeMap, (packageMange, commands) => {
    if (commands.includes(command)) {
      target = packageMange
    }
  })
  return target
}
let nodeApi = {
  cd,
  fileIsExist,
  writeFileRecursive,
  shell,
  exec: promisify(exec),
  runCommand,
  getFileExportObjInDir,
  getPlatForm,
  getPackageManageByCommand,
  loadPathByName,
  loadFileNameByPath4Ext,
  doShellCmd
};
module.exports = nodeApi