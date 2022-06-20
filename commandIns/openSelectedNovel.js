const vscode = require("vscode");
let name = "openSelectedNovel";

module.exports = {
  name,
  implementation: function (args) {
    vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(args.path));
  },
};
