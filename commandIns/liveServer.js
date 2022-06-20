let name = "liveServer";
const { exec } = require("node:child_process");
const shell = require("shelljs");
module.exports = {
  name,
  implementation: function (url) {
    shell.cd(url.path);
    exec(`live-server`, function (error, stdout, stderr) {});
  },
};
