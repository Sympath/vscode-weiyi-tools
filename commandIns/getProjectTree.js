let name = "getProjectTree";
// const { promisify } = require("util");
// const exec = promisify(require("child_process").exec);
const iconv = require("iconv-lite");
var encoding = "cp936";
var binaryEncoding = "binary";
let line = `\n`;

const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);
const { shell } = require("../utils/node-api");
module.exports = {
  name,
  implementation: async function (url) {
    shell.cd(url.path);
    try {
      let stdout = shell.exec(
        `tree -I "node_modules|history" -L 6`,
        { encoding: binaryEncoding },
        async function (err, stdout, stderr) {
          if (err) {
            vscodeApi
              .$toast()
              .err("依赖缺失，请执行 yum install tree 进行安装");
          }
          let handle = iconv.decode(
            Buffer.from(stdout, binaryEncoding),
            encoding
          );
          let arr = stdout
            .split(line)
            .filter((val) => val)
            .map((val) => {
              return val.replace("`--", "|--");
            });
          arr.pop();
          handle = arr.join(line);
          await vscodeApi.clipboard.writeText(handle);
        }
      );
    } catch (error) {}
  },
};
