let name = "insertLog";
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);
module.exports = {
  name,
  implementation: function () {
    let fileType = 'js' // 文件类型
    if (vscodeApi.currentDocumentFileType === 'sh') {

    }
    // 获取当前选中的内容
    let text = vscodeApi.selectText;
    function handleText(text) {
      let handleText = ''
      switch (fileType) {
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
          handleText = `echo $${text}`
          break;
        default:
          break;
      }
      return handleText
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
