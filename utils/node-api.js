const glob = require("glob");
const fs = require("fs");
const { exec } = require("node:child_process");
const shell = require("shelljs");
const { promisify } = require('util')
const os = require('os')
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

function getFilesInDir(dirPath, opts = {}, suffix = "js") {
  // 利用glob实现自动引入所有命令实现
  const files = glob.sync(`${dirPath}/*.${suffix}`, {
    ...opts,
  });
  const controllers = {};
  files.forEach((key) => {
    const name = key.split("/").pop().replace(/\.js/g, "");
    const value = require(key);

    controllers[name] = value;
  });
  return controllers;
}

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

module.exports = {
  fileIsExist,
  writeFileRecursive,
  shell,
  exec: promisify(exec),
  runCommand,
  getFilesInDir,
  getPlatForm
};
