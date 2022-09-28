let name = "doCommandInHere";
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);
const { shell, exec, cd } = require("../utils/node-api");
module.exports = {
  name,
  implementation: async function (url) {
    cd(url.path);
    let optionMap = {
      "live-server": {
        quickItem: {
          description: '启动静态服务'
        }// 选项详细信息 label: string;description ?: string;detail ?: string;picked ?: boolean;alwaysShow ?: boolean;
      },
      "code": {
        quickItem: {
          description: '新开vscode窗口'
        },
        options: ['./']
      },
      "custom": {
        quickItem: {
          description: '自行输入命令'
        }
      }
    }
    let quickPickOptions = Object.keys(optionMap).map(key => ({ label: key, ...(optionMap[key].quickItem) }))
    let { label: choose } = await vscodeApi.$quickPick(quickPickOptions)
    // 如果要自己输入
    if (choose === 'custom') {
      // 这个对象中所有参数都是可选参数 password 输入内容是否是密码 ignoreFocusOut 默认false，设置为true时鼠标点击别的地方输入框不会消失 placeHolder, 在输入框内的提示信息 prompt, 在输入框下方的提示信息
      let msg = await vscodeApi.$showInputBox(
        {
          placeHolder: '输入自己的命令'
        })
      debugger
      // 执行自己的命令
      choose = msg
    }
    let { options = [] } = optionMap[choose] || {}
    vscodeApi.runGlobalCommand(choose, options)
  },
};
