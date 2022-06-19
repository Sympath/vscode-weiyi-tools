const vscode = require("vscode");
const EditBehaviorHandler = require("../utils/editBehaviorHandler");
let name = "delComment";
let editBehaviorHandler = new EditBehaviorHandler(name);
function replaceDocument(matchMaps = []) {
  const editor = vscode.window.activeTextEditor;
  let text = editor.document.getText();
  let newDocumentText = text;
  matchMaps.forEach((matchMap) => {
    let { oldText, newText } = matchMap;
    newDocumentText = newDocumentText.replace(oldText, newText);
  });
  // 全量替换当前页面文本
  const end = new vscode.Position(editor.document.lineCount + 1, 0);
  editBehaviorHandler.add(
    "replace",
    new vscode.Range(new vscode.Position(0, 0), end),
    newDocumentText
  );
}
module.exports = {
  name,
  implementation: function () {
    let matchMaps = [
      {
        oldText: /((\/\*([\w\W]+?)\*\/)|(\/\/(.(?!"\)))+)|(^\s*(?=\r?$)\n))/gm,
        newText: "",
      },
      { oldText: /(^\s*(?=\r?$)\n)/gm, newText: "" },
      { oldText: /\\n\\n\?/gm, newText: "" },
    ];
    replaceDocument(matchMaps);
    editBehaviorHandler.emit();
  },
};
