let name = "insertLog";
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);
module.exports = {
  name,
  implementation: function () {
    // 获取当前选中的内容
    let text = vscodeApi.selectText;
    function handleText(text) {
      let handleText = ''
      switch (vscodeApi.currentDocumentFileType) {
        case 'js':
          let consoleKeyword = "log";
          if (text.indexOf("err") !== -1) {
            consoleKeyword = "error";
          }
          if (text.indexOf("[") !== -1) {
            consoleKeyword = "tabel";
          }
          handleText = `console.${consoleKeyword}('${text}: ',${text});\n`;
          break;

        case 'sh':
          handleText = `echo $${text}\n`
          break;
        default:
          break;
      }
      return handleText
    }
    // 在这里拼写console语句
    const logToInsert = handleText(text);
    console.log('handleText: ', handleText);
    // 执行插行方法
    vscodeApi.insertTextToNextLine(logToInsert)
    vscodeApi.emit();
  },
};
