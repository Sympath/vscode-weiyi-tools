// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const commandIns = require("./commandIns");
const subscriptions = require("./subscriptions");
const utils = require("./utils/index");
const vscode = require("vscode");
const VscodeApi = require("./utils/vscode-api");
let globalVscApi = new VscodeApi("global");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // this method is called when your extension is activated
  // your extension is activated the very first time the command is executed
  /** 注册命令
   * @param {*} name 命令名
   * @param {*} cb 命令触发时的回调
   */
  function registerCommand(opts) {
    let type = opts.type;
    let { name, cb } = opts;
    let commandIns;
    switch (type) {
      case "command":
        commandIns = vscode.commands.registerCommand(`weiyi-tools.${name}`, cb);
        context.subscriptions.push(commandIns);
        break;

      case "textEditorCommand":
        commandIns = vscode.commands.registerTextEditorCommand(
          `weiyi-tools.${name}`,
          cb
        );
        break;

      default:
        break;
    }
  }
  // vscode.window.showInformationMessage(
  //   "weiyi-tools插件激活，请执行formatArticle命令进行文档格式化"
  // );

  utils.eachObj(commandIns, (key, val) => {
    registerCommand({
      type: val.type || "command",
      name: val.name || key,
      cb: val.implementation,
    });
  });
  utils.eachObj(subscriptions, (key, val) => {
    context.subscriptions.push(val);
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
