let name = "sh";
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
        // 1. 下拉shell仓库
        // 2. 获取shells目录下的所有sh文件地址
        // 3. 弹出选择框让用户选择，点击选项即执行
        //   3.1 支持上传脚本功能
        // 1. 弹出输入框支持用户输入message信息
        // 执行shell
        try {
            let output = await nodeApi.doShellCmd(`sh ${url.path}`)
            vscodeApi.$toast(`操作成功，执行输出为：${output.stdout}`)
        } catch (error) {
            vscodeApi.$toast(`操作失败，失败原因为：${error.stderr}`)
        }
    },
};
