let name = "custom";
const fs = require("fs");
const path = require("path");
const utils = require("../utils/index");
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);
const { getFilesInDir } = require("../utils/node-api");


module.exports = {
    name,
    implementation: async function (...params) {
        let options = []
        let collectors = {}
        let hasDir = false;
        // 初始化自定义命令
        const folders = vscodeApi.vscode.workspace.workspaceFolders;
        folders.forEach((folder) => {
            let toolsDirUri = path.join(folder.uri.fsPath, "weiyi-tools");
            if (fs.existsSync(toolsDirUri)) {
                hasDir = true
                collectors = getFilesInDir(toolsDirUri);
                utils.eachObj(collectors, (name, implementation) => {
                    options.push(name);
                    let vscodeApi = new VscodeApi(name);
                    collectors[name] = (...params) => {
                        implementation.call(vscodeApi, ...params);
                        vscodeApi.emit();
                    }
                });
            }
        });
        if (options.length > 0) {
            let choose = await vscodeApi.$quickPick(options)
            if (typeof collectors[choose] === 'function') {
                collectors[choose](...params)
            }
        } else {
            let errInfo = ""
            if (hasDir) {
                errInfo = '项目根目录下weiyi-tools内容不符合插件要求'
            } else {
                errInfo = '项目根目录下weiyi-tools不存在'
            }
            vscodeApi.$toast().err(errInfo)
        }
    },
};
