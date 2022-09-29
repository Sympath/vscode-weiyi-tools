const iconv = require("iconv-lite");
var encoding = "cp936";
var binaryEncoding = "binary";
let line = "\n"; // 按换行切割 兼容win和mac

module.exports = {
    command: 'tree',
    quickItem: {
        description: '输出对应目录树结果并自动复制'
    },
    clipboard: true, // 是否需要将结果写入剪切板
    completed(cmdResult, { vscodeApi, nodeApi }) {
        if (nodeApi.getPlatForm().isWindows) {
            line = '\r\n'
        }
        let handle = cmdResult;
        if (cmdResult) {
            handle = iconv.decode(
                Buffer.from(cmdResult, binaryEncoding),
                encoding
            );
            let arr = cmdResult
                .split(line)
                .filter((val) => val)
                .map((val) => {
                    return val.replace("`--", "|--");
                });
            arr.pop();
            handle = arr.join(line);
            vscodeApi.clipboardWriteText(handle);
        } else {
            vscodeApi.$toast().err('获取结果为空')
        }
        return handle
    },
    options: ['-I', '\"node_modules|history\"', '-L', '6']
}