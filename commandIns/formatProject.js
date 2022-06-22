let name = "formatProject";
let { shell } = require("../utils/node-api");
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);
let fileRege = /.js|css|html|md|txt|jpg|png/;
let fileNameRege = /((\w|\.|-)+)/g;
let tabRege = /(\t| {3})/g;
let line = `\n`;
function getInfo(content) {
  let isFile = fileRege.test(content);
  let isDir = !isFile;
  let fileName = content.match(fileNameRege)[0];
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
    try {
      shell.cd(url.path);
      let readText = vscodeApi.clipboard.readText();
      readText.then((content) => {
        if (!content.startsWith(".")) {
          vscodeApi.$toast().err("剪切板内容非合法tree输出内容");
          return;
        }
        let fDirlevel = 0;
        let files = content
          .split(line)
          .slice(1)
          .map((item) => {
            let info = getInfo(item);
            let { fileName, level, isDir } = info;
            function handleDir() {
              let currentLevel = level - fDirlevel;
              if (currentLevel === 1) {
                // 3.1.1 成立：创建文件
              } else {
                // 3.1.2 不成立：切换到对应次数的..
                for (
                  let index = 0;
                  index < Math.abs(currentLevel) + 1;
                  index++
                ) {
                  if (fDirlevel !== 0) {
                    fDirlevel -= 1;
                    shell.cd("..");
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
              shell.mkdir(fileName);
              shell.cd(fileName);
              fDirlevel = level;
            } else {
              // 3. 如果不是：
              // 3.1 判断leve === 父level - 1是否成立
              shell.touch(fileName);
            }
          });
      });
    } catch (error) {
      vscodeApi.$toast().err(error);
    }
  },
};
