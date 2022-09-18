let name = "doCommandInHere";
const VscodeApi = require("../utils/vscode-api");
const nodeApi = require("../utils/node-api");
let vscodeApi = new VscodeApi(name);
const { shell, exec } = require("../utils/node-api");
module.exports = {
  name,
  implementation: async function (url) {
    shell.cd(url.path);
    let command = 'qt'
    let filePathArr = nodeApi.loadFileNameByPath4Ext(url.path, ['png', 'jpg', 'jpeg', 'gif'])
    for (let index = 0; index < filePathArr.length; index++) {
      const [filePath] = filePathArr[index];
      await vscodeApi.runGlobalCommand(`${command} ${filePath}`)
    }
  },
};
