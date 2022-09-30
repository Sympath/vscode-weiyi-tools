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
            },
            "interview": {
                quickItem: {
                    description: '面试'
                },// 选项详细信息 label: string;description ?: string;detail ?: string;picked ?: boolean;alwaysShow ?: boolean;
                path: '/Users/wzyan/Documents/selfspace/note-all/未雨绸缪'
            }
        }
        let quickPickOptions = Object.keys(optionMap).map(key => ({ label: key, ...(optionMap[key].quickItem) }))
        let chooseItem = await vscodeApi.$quickPick(quickPickOptions)
        if (!chooseItem) {
            return
        }
        chooseItem = optionMap[chooseItem.label]
        let { path } = chooseItem
        // 如果有自定义路径，就打开对应路径即可
        if (path) {
            vscodeApi.runGlobalCommand('code', [path])
        } else {
            vscodeApi.runGlobalCommand('code', [`${root}/${choose}.md`])
        }
    },
};
