module.exports = {
    quickPickItem: {
        order: 0,
        description: '上传所有命令'
    },
    uploaded() {
        let {
            vscodeApi,
            nodeUtils,
            key
        } = this;
        vscodeApi.$toast(`上传所有${key}成功, 快去删掉自己的实现试试叭~`)
    },
    beforeUpload() {
        let {
            vscodeApi,
            nodeUtils,
            collectors,
            pathInfo,
            key
        } = this;
        let {
            absAppDir,
            customDirPath
        } = pathInfo
        nodeUtils.doShellCmd(`cp -r ${absAppDir}/ ${customDirPath}`)
        vscodeApi.$toast(`上传所有${key}成功 , 快去删掉自己的实现试试叭~`)

        return true
    }
}