let name = "gitUpload";
const VscodeApi = require("../utils/vscode-api");
const glob = require('glob');
const fs = require('fs');
const nodeApi = require("../utils/node-api");
let vscodeApi = new VscodeApi(name);
const path = require('path')
const open = require('open');
const { typeCheck, eachObj } = require("../utils/index");


module.exports = {
    name,
    implementation: async function (url) {
        // 1. 弹出输入框支持用户输入message信息
        let message = await vscodeApi.$showInputBox({
            placeHolder: '请输入message'
        })
        // 2. 获取指定目录下所有有.git目录的父目录路径
        let pathArr = nodeApi.loadPathByName(url.path, ['.git'])
        // 3. 批量处理：切换进父目录，执行`git add . && git commit -m "${message}" && git push`
        let gitUploadCmd = `git add . && git commit -m "${message}" && git push`
        for (let index = 0; index < pathArr.length; index++) {
            const [, {
                dirPath
            }] = pathArr[index];
            nodeApi.shell.cd(dirPath);
            await nodeApi.doShellCmd(gitUploadCmd);
        }
    },
};
