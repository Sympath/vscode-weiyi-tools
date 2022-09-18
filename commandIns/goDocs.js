let name = "goDocs";
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);
const open = require('open');
const {
    ACCESS_DOCUMENT_URL
} = require("../config/variable.js");

module.exports = {
    name,
    implementation: async function () {
        // 引导用户阅读文档
        let needGo = await vscodeApi.$confirm(`需要看在线文档不`, "去呀")
        if (needGo === '去呀') {
            open(ACCESS_DOCUMENT_URL)
        }
    },
};
