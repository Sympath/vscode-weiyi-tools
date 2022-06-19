const vscode = require("vscode");
module.exports = {
  name: "helloWorld",
  implementation: function () {
    // The code you place here will be executed every time your command is executed
    //   vscode.window.setStatusBarMessage("你好，前端艺术家！");
    vscode.window.showInformationMessage("我是info信息！");
    vscode.window.showErrorMessage("我是错误信息！");
    // Display a message box to the user
    vscode.window
      .showInformationMessage("是否热爱前端", "是", "否", "不再提示")
      .then((result) => {
        if (result === "是") {
          // 其它操作
        } else if (result === "不再提示") {
          // 其它操作
        }
      });
  },
};
