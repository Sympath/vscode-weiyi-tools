module.exports = {
    snippets: [
        {
            prefix: "length",
            handler(vari) {
                let handleText = '${#innerArr[@]}'
                if (vari) {
                    handleText = `len=${handleText.replace('innerArr', vari)}`
                }
                return handleText
            },
            // uploadCallback 支持上传成功后的回调
        }
    ]
}