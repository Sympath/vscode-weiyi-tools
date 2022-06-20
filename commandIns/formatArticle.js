const vscode = require("vscode");
const EditBehaviorHandler = require("../utils/editBehaviorHandler");
let name = "formatArticle";
let editBehaviorHandler = new EditBehaviorHandler(name);
const replaceText = (oldText, newText) => {
  const editor = vscode.window.activeTextEditor;
  const document = editor.document;
  const documentText = document.getText();
  if (!editor) {
    return;
  }
  let replaceStatements = [];
  // 检测console的正则表达式
  const textRegex = new RegExp(oldText, "g");
  let match;
  // 正则循环匹配页面文本
  while ((match = textRegex.exec(documentText))) {
    // 每次匹配到当前的范围--Range
    let matchRange = new vscode.Range(
      document.positionAt(match.index),
      document.positionAt(match.index + match[0].length)
    );
    // let line = document.line;
    if (!matchRange.isEmpty)
      // 把Range放入数组
      replaceStatements.push({
        range: matchRange,
        newText: typeof newText === "function" ? newText(match) : newText,
      });
  }
  // 循环遍历每个匹配项的range，并删除
  replaceStatements.forEach((replaceItem) => {
    let { range, newText } = replaceItem;
    editBehaviorHandler.add("replace", range, newText);
  });
};
function replaceDocument(matchMaps = []) {
  const editor = vscode.window.activeTextEditor;
  let text = editor.document.getText();
  let newDocumentText = text;
  matchMaps.forEach((matchMap) => {
    let { oldText, newText } = matchMap;
    // debugger
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
const insertText = (val, line = 0, startCharacter = 0) => {
  // edit方法获取editBuilder实例，在后一行添加
  let startLine = line;

  editBehaviorHandler.add(
    "insert",
    new vscode.Position(startLine, startCharacter),
    val
  );
};
module.exports = {
  name,
  implementation: function () {
    let replaceItems = [
      {
        oldText: /([\u4e00-\u9fa5]+)([\da-zA-Z]+)/g,
        newText: "$1 $2",
      },
      {
        oldText: /([\da-zA-Z]+)([\u4e00-\u9fa5]+)/g,
        newText: "$1 $2",
      },
      {
        oldText: /!\[.+\]/,
        newText: "![]",
      },
    ];
    replaceDocument(replaceItems);
    insertText(`---
theme: cyanosis
highlight: atom-one-dark
---
> 王志远，微医前端技术部
`);
    editBehaviorHandler.emit();
  },
};
