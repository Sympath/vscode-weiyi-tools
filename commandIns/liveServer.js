let name = "liveServer";
const { exec } = require("node:child_process");
const vscodeApi = require("../utils/vscode-api");
const shell = require("shelljs");
module.exports = {
  name,
  implementation: function (url) {
    shell.cd(url.path);
    try {
      exec(`live-server`, function (error, stdout, stderr) {
        if (error) {
          vscodeApi
            .$toast()
            .err("依赖缺失，请执行 npm i live-server -g 进行安装");
        }
      });
    } catch (error) {}
  },
};
