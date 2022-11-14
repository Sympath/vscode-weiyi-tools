module.exports = {
    quickItem: {
        description: '下载指定仓库'
    },
    async options(vscodeApi) {
        let content = await vscodeApi.clipboardText
        return [content]
    }
}