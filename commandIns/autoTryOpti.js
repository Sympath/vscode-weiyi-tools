let name = "autoTryOpti";
const fs = require("fs");
const path = require("path");
const { promisify } = require('util');
const nodeApi = require("../utils/node-api");
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);

let optiTemplateTs = path.join(__dirname, './applovin/auto-try/opti-template.ts')
let xmlPath = '' // xml路径
let xmlStr = '' // xml内容

const containsSpecificKeywords = (text) => {
  // 匹配关键词 "getChild"、"getParent" 或 "anchNode"
  const keywordsRegex = /(getChild|getParent|anchNode)/;

  return keywordsRegex.test(text);
};

// 读取指定路径文件并返回文件内容字符串
function readFileContent(filePath) {
  // 将 fs.readFile 方法转换成 Promise 形式
  const readFilePromise = promisify(fs.readFile);
  return readFilePromise(filePath, 'utf8');
}

const extractCreateActionsParams = (text) => {
  // 匹配 createActions(...) 部分的正则表达式，使用修饰符 s
  const regex = /createActions = \(([\s\S]*?)\)/;
  const match = text.match(regex);

  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
};
/** 判断指定路径文件是否存在
 * 
 * @param {*} filePath 
 * @returns 
 */
function checkFileExistsAsync(filePath) {
  const access = promisify(fs.access);
  return access(filePath, fs.constants.F_OK)
    .then(() => true) // 文件存在
    .catch(() => false); // 文件不存在
}

module.exports = {
  name,
  implementation: async function () {
    try {
      vscodeApi.$log(`业务流程熟悉可见文档 https://uathzwgnr7.feishu.cn/docx/ZKS8drLFVocq7IxwUNRciTA2n9f`)
      vscodeApi.$log(`工具实现思路可见文档 https://uathzwgnr7.feishu.cn/docx/YCVVdzFxFoDyrjxFqyoc7m4dnfe`)
      vscodeApi.$log(` ==========================`)
      xmlPath = vscodeApi.currentDocumentPath;
      xmlStr = await readFileContent(xmlPath)
      // 如果存在关键字 则不能进行自动优化
      if (containsSpecificKeywords(xmlStr)) {
        vscodeApi.$toast().err('存在关键字 则不能进行自动优化');
        return
      }
      let vscodeRootPath = await vscodeApi.getRelativeRootPromise();
      // 如果是在处理脚本文件
      if (xmlPath.endsWith(".ts")) {
        let choose = await vscodeApi.$confirm("是否使用脚本优化功能", "是", "否")
        if (choose === '是') {
          let templateTs = `${vscodeRootPath}/xml/opti-template.ts`
          let templateIsExist = await checkFileExistsAsync(templateTs)
          if (!templateIsExist) {
            let chooseTs = await vscodeApi.$confirm("请配置xml/opti-template.ts 是否采用并生成默认模版", "是", "否")
            if (chooseTs === '是') {
              templateTs = optiTemplateTs
              await nodeApi.doShellCmd(`cp ${optiTemplateTs} ${vscodeRootPath}/xml/opti-template.ts`)
            } else {
              vscodeApi.$toast('请配置xml/replaceHolder-template.ts后再次执行')
              return
            }
          }

          let paramsStr = extractCreateActionsParams(xmlStr)
          let templateStr = await readFileContent(templateTs)
          let handledTemplateStr = templateStr.replace('// opti-ReplaceHolder', `(${paramsStr})`)
          await nodeApi.writeFileRecursive(
            xmlPath,
            handledTemplateStr
          );
          let shRelatePath = xmlPath.split('stores/')[1];
          let startCmd = `ENTRY=${shRelatePath} npm run start`;
          // vscodeApi.clipboardWriteText(`gac "feat: ${storeFolderName}脚本完成" && gp`)
          vscodeApi.clipboardWriteText(startCmd)
          vscodeApi.$toast('脚本生成成功✅✅✅ 脚本执行命令已生成至剪切板 可直接粘贴执行')
          vscodeApi.$log(`脚本完成后提交命令 === git add . && git commit -m "fix: ${shRelatePath}脚本时间优化完成" && git push`)
        }
        return
      }
    } catch (error) {
      vscodeApi.$toast().err("执行失败 错误原因见OUTPUT面板日志");
      vscodeApi.$log(error.message || error.stderr);
    }

  },
};
