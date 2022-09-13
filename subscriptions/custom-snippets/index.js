let name = "custom-shell-collect";
const VscodeApi = require("../../utils/vscode-api");
let vscodeApi = new VscodeApi(name);
const path = require('path')
const {
    CUSTOM_SNIPPETS_DIR
} = require("../../config/variable.js");
const nodeUtils = require("../../utils/node-api");
const { eachObj } = require("../../utils");
let { getFileExportObjInDir } = nodeUtils

// 自定义命令和对应实现
let collectors = {}
let customShellSnippetsPath = path.resolve(__dirname, '../customShellSnippets')
// 获取自定义命令 持久化后的内容
collectors = getFileExportObjInDir(customShellSnippetsPath, 'js');
// 看本地是否有实现命令
try {
    // 初始化自定义命令
    vscodeApi.getAbsPathByRelativeRoot(CUSTOM_SNIPPETS_DIR, (absPath) => {
        // 获取项目根目录下的自定义命令
        let rootDirCollectors = getFileExportObjInDir(absPath, 'js', {
            removeRequireCache: true
        });
        collectors = Object.assign(collectors, rootDirCollectors)
    });
} catch (error) {
    vscodeApi.$toast().err(error)
}
let collectorsObj = {};
eachObj(collectors, (variType, snippetsWrap) => {
    snippetsWrap.snippets.forEach(snippet => {
        let {
            prefix,
            handler
        } = snippet
        collectorsObj[`${variType}-${prefix}`] = handler
    })
})
module.exports = collectorsObj