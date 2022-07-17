// 生成训练营模板
const path = require("path");
let name = "train";
const { typeCheck } = require("../utils/index");
const nodeUtils = require("../utils/node-api");
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);

module.exports = {
    name,
    implementation: async function () {
        vscodeApi.getRelativeRoot(async (fsPath) => {
            let msg = await vscodeApi.$showInputBox(
                { // 这个对象中所有参数都是可选参数
                    password: false, // 输入内容是否是密码
                    ignoreFocusOut: true, // 默认false，设置为true时鼠标点击别的地方输入框不会消失
                    placeHolder: '请输入训练营关键词', // 在输入框内的提示信息
                    prompt: '比如vscode训练营，那就是vscode', // 在输入框下方的提示信息
                })
            nodeUtils.exec(`mkdir ${fsPath}/${msg}训练营`)
            nodeUtils.exec(`cp -r ${path.resolve(__dirname, '../public/训练营/')}/ ${fsPath}/${msg}训练营`)
        })
    },
};
