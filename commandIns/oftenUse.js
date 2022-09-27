let name = "oftenUse";
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);
const { shell, exec } = require("../utils/node-api");
module.exports = {
    name,
    implementation: async function () {
        let root = '/Users/wzyan/Documents/selfspace/often-use'
        let optionMap = {
            "interest": {
                quickItem: {
                    description: '书/电影/音乐'
                }// 选项详细信息 label: string;description ?: string;detail ?: string;picked ?: boolean;alwaysShow ?: boolean;
            }
        }
        let quickPickOptions = Object.keys(optionMap).map(key => ({ label: key, ...(optionMap[key].quickItem) }))
        let { label: choose } = await vscodeApi.$quickPick(quickPickOptions)
        vscodeApi.runGlobalCommand('code', [`${root}/${choose}.md`])
    },
};
