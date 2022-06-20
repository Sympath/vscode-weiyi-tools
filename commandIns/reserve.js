const vscode = require("vscode");
module.exports = {
  name: "reserve",
  implementation: function () {
    // The code you place here will be executed every time your command is executed

    // Display a message box to the user
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    let document = editor.document;
    let selection = editor.selection;
    let text = document.getText(selection);
    let result = text.split("").reverse().join("");
    editor.edit((editBuilder) => {
      editBuilder.replace(selection, result);
    });
  },
};
