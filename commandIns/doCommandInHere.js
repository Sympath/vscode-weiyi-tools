let name = "doCommandInHere";
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);
const nodeApi = require("../utils/node-api");
const path = require('path');
const utils = require("../utils/index");
let { shell, exec, cd } = nodeApi

module.exports = {
  name,
  implementation: async function (url) {
    cd(url.path);
    // 自定义命令和对应实现
    let optionMap = {}
    let customCommandInsPath = path.resolve(__dirname, `./doCommands`)
    // 获取自定义命令 持久化后的内容
    optionMap = nodeApi.getFileExportObjInDir(customCommandInsPath, 'js');
    let quickPickOptions = Object.keys(optionMap).map(key => ({ label: key, ...(optionMap[key].quickItem) }))
    let { label: choose } = await vscodeApi.$quickPick(quickPickOptions)
    // 如果要自己输入
    if (choose === 'custom') {
      // 这个对象中所有参数都是可选参数 password 输入内容是否是密码 ignoreFocusOut 默认false，设置为true时鼠标点击别的地方输入框不会消失 placeHolder, 在输入框内的提示信息 prompt, 在输入框下方的提示信息
      let msg = await vscodeApi.$showInputBox(
        {
          placeHolder: '输入自己的命令'
        })
      // 执行自己的命令
      choose = msg
    }
    let { options = [], completed, command, kind } = optionMap[choose] || {}
    let isFunction = utils.typeCheck('AsyncFunction')(options);
    if (isFunction) {
      options = await options(vscodeApi)
    }
    // 如果没有定义对应命令，就使用文件名作为命令
    if (!command) {
      command = choose
    }
    try {
      if (kind === 'vscode') {
        vscodeApi.runVscodeCommand(command)
      }
      else {
        let out = await vscodeApi.runGlobalCommand(command, options)
        let context = {
          vscodeApi,
          nodeApi,
          utils
        }
        // 如果存在钩子函数，则必须将处理后的结果返回
        let { done, result } = utils.callFn(completed, out, context)
        if (done) {
          out = result
        }
        vscodeApi.log(out)
      }
    } catch (error) {
      vscodeApi.$toast().err(error)
    }
  },
};
