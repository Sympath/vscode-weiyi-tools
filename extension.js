// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const commandIns = require("./commandIns");
const utils = require("./utils/index");
let Provider = require("./novel/Provider");
const vscode = require("vscode");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // vscode.window.showInformationMessage(
  //   "edit-article插件激活，请执行formatArticle命令进行文档格式化"
  // );
  /** 注册命令
   * @param {*} name 命令名
   * @param {*} cb 命令触发时的回调
   */
  function registerCommand(name, cb) {
    let commandIns = vscode.commands.registerCommand(
      `edit-article.${name}`,
      cb
    );
    context.subscriptions.push(commandIns);
  }

  utils.eachObj(commandIns, (key, val) => {
    registerCommand(key, val.implementation);
  });

  // 提供数据的类
  // const provider = new Provider();

  // 数据注册
  // vscode.window.registerTreeDataProvider("novel-list", provider);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
