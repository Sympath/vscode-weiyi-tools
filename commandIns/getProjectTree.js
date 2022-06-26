let name = "getProjectTree";
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
    let command = `tree -I "node_modules|history" -L 6`
    try {
      let { stdout } = await vscodeApi.runGlobalCommand(command)
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
    } catch (error) { }
  },
};
