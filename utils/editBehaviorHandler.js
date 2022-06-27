const vscode = require("vscode");
module.exports = class EditBehaviorHandler {
  constructor(commandName) {
    this.name = commandName;
    this.queue = [];
  }
  add(opt, ...args) {
    this.queue.push({
      opt,
      args,
    });
  }
  emit() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      editor.edit((editBuilder) => {
        this.queue.forEach((edit) => {
          let { opt, args } = edit;
          editBuilder[opt](...args);
        });
        this.queue = [];
        //   执行保存动作
        vscode.commands.executeCommand("editor.action.formatDocument");
        vscode.commands.executeCommand("workbench.action.files.save");
        // vscode.window.showInformationMessage(`${this.name}执行完成`);
      });
    }
  }
};
