let name = "custom";
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);
const path = require('path')
const open = require('open');
const { typeCheck, eachObj } = require("../utils/index");
const {
    CUSTOM_DIR,
    ACCESS_DOCUMENT_URL
} = require("../config/variable.js");
const { getFileExportObjInDir } = require("../utils/node-api");


module.exports = {
    name,
    implementation: async function (...params) {
        // 自定义命令集合
        let options = []
        // 自定义命令和对应实现
        let collectors = {}
        let customCommandInsPath = path.resolve(__dirname, './customCommandIns')
        // 获取自定义命令 持久化后的内容
        collectors = getFileExportObjInDir(customCommandInsPath, 'js');
        // 看本地是否有实现命令
        try {
            // 初始化自定义命令
            vscodeApi.getAbsPathByRelativeRoot(CUSTOM_DIR, (absPath) => {
                // 获取项目根目录下的自定义命令
                rootDirCollectors = getFileExportObjInDir(absPath, 'js', {
                    removeRequireCache: true
                });
                collectors = Object.assign(collectors, rootDirCollectors)
            });
        } catch (error) {
            vscodeApi.$toast().err(error)
        }
        eachObj(collectors, (name, implementation) => {
            if (typeCheck('Function')(implementation)) {
                implementation = {
                    commandHandler: implementation,
                    quickPickItem: {
                    }
                }
            }
            let {
                commandHandler,
                quickPickItem
            } = implementation
            if (typeCheck('Undefined')(quickPickItem.label)) {
                quickPickItem.label = name
            }
            if (typeCheck('Undefined')(quickPickItem.order)) {
                quickPickItem.order = 9999
            }
            options.push({
                ...quickPickItem,
            });
            let vscodeApi = new VscodeApi(name);
            collectors[quickPickItem.label] = (...params) => {
                commandHandler.call(vscodeApi, ...params);
                vscodeApi.emit();
            }
        });
        options.sort((a, b) => a.order - b.order)
        if (options.length > 1) {
            let choose = await vscodeApi.$quickPick(options)
            let chooseLabel = choose && choose.label
            if (typeCheck('Function')(collectors[chooseLabel])) {
                collectors[chooseLabel](...params)
            }
        } else {
            let result = await vscodeApi.$confirm('暂无自定义命令，快去根据文档实现自己的命令吧！', "看文档去")
            if (result === "看文档去") {
                open(ACCESS_DOCUMENT_URL)
            }
        }
    },
};
