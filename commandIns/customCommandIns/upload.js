
let name = "upload";
const VscodeApi = require("../../utils/vscode-api");
let vscodeApi = new VscodeApi(name);
const { getFileExportObjInDir, shell, exec } = require("../../utils/node-api");
const {
    CUSTOM_DIR
} = require("../../config/variable.js");
module.exports = function () {
    this.$toast('开始上传')
    vscodeApi.getAbsPathByRelativeRoot(CUSTOM_DIR, (absPath) => {
        exec(`cp -r ${absPath}/ ${__dirname}`)
        this.$toast('上传完成')
    });
}