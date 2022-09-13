let name = "upload-custom-snippet";
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);
const path = require('path')
const open = require('open');
const { typeCheck, eachObj } = require("../utils/index");
const {
    CUSTOM_SHELL_DIR,
    ACCESS_DOCUMENT_URL
} = require("../config/variable.js");
const nodeUtils = require("../utils/node-api");
let { getFileExportObjInDir } = nodeUtils


module.exports = {
    name,
    implementation: async function (...params) {
        // 自定义命令集合
        let options = []
        // 自定义命令和对应实现
        let collectors = {}
        // 看本地是否有实现命令
        try {
            // 初始化自定义命令
            vscodeApi.getAbsPathByRelativeRoot(CUSTOM_SHELL_DIR, (absPath) => {
                // 获取项目根目录下的自定义命令
                let rootDirCollectors = getFileExportObjInDir(absPath, 'js', {
                    removeRequireCache: true
                });
                collectors = Object.assign(collectors, rootDirCollectors)
            });
        } catch (error) {
            vscodeApi.$toast().err(error)
        }
        eachObj(collectors, (name, implementation) => {
            let {
                quickPickItem = {},
                uploadCallback = () => { }
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
            let context = {
                vscodeApi,
                nodeUtils
            }
            // 上传后的回调
            collectors[quickPickItem.label] = (...params) => {
                uploadCallback.call(context, ...params);
                vscodeApi.emit();
            }
        });
        options.sort((a, b) => a.order - b.order)
        let uploadAllKey = 'upload-all'
        if (options.length >= 1) {
            options.unshift({
                label: uploadAllKey
            })
            let choose = await vscodeApi.$quickPick(options)
            let chooseLabel = choose && choose.label
            // 这里用scp命令上传至服务器同步 w-todo
            // 上传后的回调执行
            if (typeCheck('Function')(collectors[chooseLabel])) {
                collectors[chooseLabel](...params)
            }
            if (chooseLabel === uploadAllKey) {
                vscodeApi.$toast('上传所有snippet成功')
            }
        } else {
            let result = await vscodeApi.$confirm('暂无自定义snippet，快去根据文档实现自己的snippet吧！', "看文档去")
            if (result === "看文档去") {
                open(ACCESS_DOCUMENT_URL)
            }
        }
    },
};
