
let name = "upload";
const VscodeApi = require("../../utils/vscode-api");
let vscodeApi = new VscodeApi(name);
const { exec } = require("../../utils/node-api");
const {
    CUSTOM_DIR
} = require("../../config/variable.js");
module.exports = {
    quickPickItem: {
        order: 0,
        description: '本地命令上传至插件空间'
    },
    commandHandler() {
        this.$toast('开始上传')
        vscodeApi.getAbsPathByRelativeRoot(CUSTOM_DIR, async (absPath) => {
            await exec(`cp -r ${absPath}/ ${__dirname}`)
            this.$toast('上传完成')
        });
    }
}