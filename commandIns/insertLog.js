const vscode = require("vscode");
module.exports = {
  name: "insertLog",
  implementation: function () {
    const insertText = (val) => {
      const editor = vscode.window.activeTextEditor;
      const selection = editor.selection;
      // 获取光标当前行
      const lineOfSelectedVar = selection.active.line;
      // edit方法获取editBuilder实例，在后一行添加
      let decorationType = vscode.window.createTextEditorDecorationType({
        color: "yellow",
      });
      let startLine = lineOfSelectedVar + 1;
      let endLine = lineOfSelectedVar + 1;
      let startCharacter = 0;
      let endCharacter = val.length - 1;
      editor.edit((editBuilder) => {
        editBuilder.insert(new vscode.Position(startLine, 0), val);
        setTimeout(() => {
          editor.setDecorations(decorationType, [
            new vscode.Range(startLine, startCharacter, endLine, endCharacter),
          ]);
        }, 0);
      });
    };
    // 拿到当前编辑页面的内容对象 editor
    const editor = vscode.window.activeTextEditor;
    // 拿到光标选中的文本并格式化
    const selection = editor.selection;
    const text = editor.document.getText(selection);
    function handleText(text) {
      let consoleKeyword = "log";
      if (text.indexOf("err") !== -1) {
        consoleKeyword = "error";
      }
      if (text.indexOf("[") !== -1) {
        consoleKeyword = "tabel";
      }
      return `console.${consoleKeyword}('${text}: ',${text});\n`;
    }
    // 在这里拼写console语句
    const logToInsert = handleText(text);
    // 执行插行方法
    text ? insertText(logToInsert) : insertText("console.log();");
  },
};
