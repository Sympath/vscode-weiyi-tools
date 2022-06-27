let name = "custom";
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);
const path = require('path')
const utils = require("../utils/index");
const {
    CUSTOM_DIR
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
        try {
            // 初始化自定义命令
            vscodeApi.getAbsPathByRelativeRoot(CUSTOM_DIR, (absPath) => {
                // 获取项目根目录下的自定义命令
                rootDirCollectors = getFileExportObjInDir(absPath, 'js', {
                    removeRequireCache: true
                });
                collectors = Object.assign(collectors, rootDirCollectors)
                utils.eachObj(collectors, (name, implementation) => {
                    options.push(name);
                    let vscodeApi = new VscodeApi(name);
                    collectors[name] = (...params) => {
                        implementation.call(vscodeApi, ...params);
                        vscodeApi.emit();
                    }
                });
            });
            if (options.length > 0) {
                let choose = await vscodeApi.$quickPick(options)
                if (typeof collectors[choose] === 'function') {
                    collectors[choose](...params)
                }
            } else {
                vscodeApi.$toast().err('项目根目录下weiyi-tools内容不符合插件要求')
            }
        } catch (error) {
            vscodeApi.$toast().err(error)
        }
    },
};
