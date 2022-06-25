let name = "liveServer";
const { exec } = require("node:child_process");
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);
const { shell, runCommand } = require("../utils/node-api");
module.exports = {
  name,
  implementation: async function (url) {
    shell.cd(url.path);
    try {
      await runCommand(`live-server`);
    } catch (error) {
      debugger;
      vscodeApi.$toast().err("依赖缺失，请执行 npm i live-server -g 进行安装");
    }
  },
};
