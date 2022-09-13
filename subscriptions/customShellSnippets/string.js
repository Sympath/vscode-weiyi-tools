module.exports = {
    snippets: [
        {
            prefix: "length",
            handler(vari) {
                let handleText = '${#str}'
                if (vari) {
                    handleText = `len=${handleText.replace('str', vari)}`
                }
                return handleText
            }
        }
    ],
    // 上传成功后的回调 上下文对象包含vscodeApi 和 nodeApi 具体可见文档
    uploadCallback() {
        this.vscodeApi.$toast('length 语句生成成功')
    }
}