const path = require("path");
let name = "initConfig";
const { typeCheck } = require("../utils/index");
const nodeApi = require("../utils/node-api");
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);
const {
    A_INITCONFIG_DIR,
    C_INITCONFIG_DIR
} = require("../config/variable.js");

module.exports = {
    name,
    implementation: async function () {
        let Workspace = vscodeApi.vscode.workspace;
        const folders = Workspace.workspaceFolders;
        let initConfigsPath = path.resolve(__dirname, `./${A_INITCONFIG_DIR}`)
        let fileMap = nodeApi.getFileExportObjInDir(initConfigsPath, 'js');
        // 看本地是否有实现命令
        try {
            // 初始化自定义命令
            vscodeApi.getAbsPathByRelativeRoot(C_INITCONFIG_DIR, (absPath) => {
                // 获取项目根目录下的自定义命令
                let rootDirCollectors = nodeApi.getFileExportObjInDir(absPath, 'js', {
                    removeRequireCache: true
                });
                fileMap = Object.assign(fileMap, rootDirCollectors)
            });
        } catch (error) {
            vscodeApi.$toast().err(error)
        }
        let options = Object.keys(fileMap)
        let choose = await vscodeApi.$quickPick(options)
        folders.forEach(async (folder) => {
            // 获取当前工作区目录
            let info = fileMap[choose];
            if (typeCheck('String')(fileMap[choose])) {
                info = {
                    path: 'choose',
                    content: fileMap[choose]
                }
            }
            let filePath = path.join(folder.uri.fsPath, info.path)
            let {
                content,
                path: fileName
            } = info;
            let isExist = await nodeApi.fileIsExist(filePath);
            // 判断配置文件是否存在，如果不存在，写入指定内容；如果存在，提示自动生成失败
            if (isExist) {
                vscodeApi.$toast().err(`${fileName}已存在，自动生成失败`);
            } else {
                try {
                    await nodeApi.writeFileRecursive(filePath, content);
                    vscodeApi.$toast(`${fileName}自动生成成功`);
                } catch (error) {
                    vscodeApi.$toast().err(`${fileName}已存在，自动生成失败，${err}`);
                }
            }
        });
    },
};
