let name = "stagingInit";
const nodeApi = require("../utils/node-api");
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);

module.exports = {
    name,
    implementation: async function () {
        let optionMap = {
            'vue': {
                quickItem: {}, // 选项详细信息 label: string;description ?: string;detail ?: string;picked ?: boolean;alwaysShow ?: boolean;
                command: 'npm install -g @vue/cli'
            }
        }
        let options = Object.keys(optionMap)
        let choose = await vscodeApi.$quickPick(options)
        if (!choose) {
            return
        }
        let { command } = optionMap[choose]
        await nodeApi.runCommand(command)
        vscodeApi.$toast(choose + '安装完成')
    },
};
