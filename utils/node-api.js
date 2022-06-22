const fs = require("fs");
const shell = require("shelljs");
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

module.exports = {
  fileIsExist,
  writeFileRecursive,
  shell,
};
