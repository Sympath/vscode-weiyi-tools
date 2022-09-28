let name = "formatProject";
let { shell, cd, runCommand } = require("../utils/node-api");
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);
let fileRege = /.js|css|html|md|txt|jpg|png|woff|woff2|eot|ttf|otf/;
let fileNameRege = /((\w|\.|-)+)/g;
let tabRege = /(\t| {3})/g;
let line = /\r?\n/; // 按换行切割 兼容win和mac
function getInfo(content) {
  let isFile = fileRege.test(content);
  let isDir = !isFile;
  let fileName = (content.match(fileNameRege) || []).pop();
  let level = (content.match(tabRege) || []).length + 1;
  return {
    isFile,
    fileName,
    level,
    isDir,
  };
}

module.exports = {
  name,
  implementation: function (url) {
    // var { dir } = path.parse(url.path);
    // shell.cd(dir);
    // let content = fs.readFileSync(url.path, "utf-8");
    debugger
    try {
      runCommand(`cd ${url.path}`);
      let readText = vscodeApi.clipboardText;
      readText.then((content) => {
        if (!content.startsWith(".")) {
          vscodeApi.$toast().err("剪切板内容非合法tree输出内容");
          return;
        }
        let fDirlevel = 0;
        let files = content.split(line).filter((val) => {
          // 如果内容是空字符串或者.,过滤掉
          if (val === "" || val === ".") {
            return false;
          }
          return true;
        });
        // 如果最后一行内容是tree输出的【xx directories，xx files】,过滤掉
        if (
          files[files.length - 1].indexOf("directories") !== -1 ||
          files[files.length - 1].indexOf("files") !== -1
        ) {
          files.pop();
        }
        debugger
        files.forEach((item) => {
          let info = getInfo(item);
          let { fileName, level, isDir } = info;
          function handleDir() {
            let currentLevel = level - fDirlevel;
            if (currentLevel === 1) {
              // 3.1.1 成立：创建文件
            } else {
              // 3.1.2 不成立：切换到对应次数的..
              for (let index = 0; index < Math.abs(currentLevel) + 1; index++) {
                if (fDirlevel !== 0) {
                  fDirlevel -= 1;
                  runCommand(`cd ..`);
                }
              }
            }
          }
          handleDir();
          // 1. 判断是否为目录
          if (isDir) {
            // 2. 如果是：
            // 2.1. 创建目录
            // 2.2 进入此目录
            // 2.3 记录此目录为父目录
            runCommand(`mkdir ${fileName}`);
            runCommand(`cd ${fileName}`);
            fDirlevel = level;
          } else {
            // 3. 如果不是：
            // 3.1 判断leve === 父level - 1是否成立
            runCommand(`touch ${fileName}`);
          }
        });
      });
    } catch (error) {
      vscodeApi.$toast().err(error && error.message);
    }
  },
};
