const vscode = require("vscode");
function toCamel(str) {
  let answer = "";
  answer = str.replace(/([^_])(?:_+([^_]))/g, function ($0, $1, $2) {
    return $1 + $2.toUpperCase();
  });
  answer = answer.replace(/([^-])(?:-+([^-]))/g, function ($0, $1, $2) {
    return $1 + $2.toUpperCase();
  });
  return answer;
}
module.exports = {
  name: "toCamel",
  implementation: function () {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    let document = editor.document;
    let selection = editor.selection;
    let text = document.getText(selection);
    let result = toCamel(text);
    editor.edit((editBuilder) => {
      editBuilder.replace(selection, result);
    });
  },
};
