let name = "delLog";
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);

module.exports = {
  name,
  implementation: function () {
    function getAllLogStatements() {
      const editor = vscodeApi.vscode.window.activeTextEditor;
      // 获取编辑器页面文本
      const document = editor.document;
      const documentText = document.getText();

      let logStatements = [];
      // 检测console的正则表达式
      const logRegex =
        /console.(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count)\((.*)\);?/g;
      let match;
      // 正则循环匹配页面文本
      while ((match = logRegex.exec(documentText))) {
        // 每次匹配到当前的范围--Range
        let matchRange = new vscodeApi.vscode.Range(
          document.positionAt(match.index),
          document.positionAt(match.index + match[0].length)
        );
        if (!matchRange.isEmpty)
          // 把Range放入数组
          logStatements.push(matchRange);
      }
      return logStatements;
    }
    const editor = vscodeApi.vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    let workspaceEdit = new vscodeApi.vscode.WorkspaceEdit();
    const document = editor.document;

    const logStatements = getAllLogStatements();

    // 循环遍历每个匹配项的range，并删除
    logStatements.forEach((log) => {
      workspaceEdit.delete(document.uri, log);
    });
    // 完成后显示消息提醒
    vscodeApi.vscode.workspace.applyEdit(workspaceEdit).then(() => {
      vscodeApi.vscode.window.showInformationMessage(
        `${logStatements.length} console.log deleted`
      );
    });
  },
};
