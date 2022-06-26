let name = "liveServer";
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);
const { shell, exec } = require("../utils/node-api");
module.exports = {
  name,
  implementation: async function (url) {
    shell.cd(url.path);
    let command = 'live-server'
    vscodeApi.runGlobalCommand(command)
  },
};
