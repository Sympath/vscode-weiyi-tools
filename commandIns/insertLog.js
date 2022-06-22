let name = "insertLog";
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);
module.exports = {
  name,
  implementation: function () {
    // 获取当前选中的内容
    let text = vscodeApi.selectText;
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
    text
      ? vscodeApi.insertTextToNextLine(logToInsert)
      : vscodeApi.insertTextToNextLine("console.log();");
    vscodeApi.emit();
  },
};
