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
        // 自定义命令集合
        let options = []
        // 自定义命令和对应实现
        let collectors = {}
        try {
            // 初始化自定义命令
            vscodeApi.getAbsPathByRelativeRoot("weiyi-tools", (absPath) => {
                collectors = getFilesInDir(absPath);
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
