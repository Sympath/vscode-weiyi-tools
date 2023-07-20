let name = "geneAutoTry";
const vscode = require("vscode");
const VscodeApi = require("../utils/vscode-api");
const nodeApi = require("../utils/node-api");
let vscodeApi = new VscodeApi(name);
function removeSpecialCharactersAndLowerCase(input) {
  // 去除特殊字符和空格
  const cleanedString = input.replace(/[^\w\s]/g, '').replace(/\s+/g, '');

  // 将字符串转换为全小写
  const lowerCaseString = cleanedString.toLowerCase();

  return lowerCaseString;
}
module.exports = {
  name,
  implementation: async function () {
    try {
      let storeName = await vscodeApi.$showInputBox({
        placeHolder:
          "请输入店铺名",
      });
      let storeFolderName = removeSpecialCharactersAndLowerCase(storeName)
      let storeID = await vscodeApi.$showInputBox({
        placeHolder:
          "请输入店铺ID",
      });
      let platform = await vscodeApi.$quickPick(['web', 'app'], {
        placeHolder: '请输入平台',
      })
      let country = await vscodeApi.$quickPick(['us', 'gb', 'fr'], {
        placeHolder:
          "请输入国家缩写"
      });
      vscodeApi.$toast('开始生成...')
      let vscodeRootPath = await vscodeApi.getRelativeRootPromise();
      let folderPath = `${vscodeRootPath}/src/stores/${storeFolderName}`
      await nodeApi.doShellCmd(`mkdir ${folderPath}`);
      let platformFolderPath = `${folderPath}/${platform}/`
      await nodeApi.doShellCmd(`mkdir ${platformFolderPath}`);
      let metaStr = `[
  {
    "storeId": "${storeID}",
    "name": "${storeName}",
    "iconUrl": "https://images.dev.rp.al-array.com/icons/${storeID}.webp",
    "client": "${platform}",
    "script": "${platform}/${country}.ts"
  }
]
`
      await nodeApi.writeFileRecursive(
        `${folderPath}/meta.json`,
        metaStr
      );
      let templateTs = `${vscodeRootPath}/xml/template.ts`
      let targetTs = `${platformFolderPath}${country}.ts`;
      await nodeApi.doShellCmd(`cp ${templateTs} ${targetTs}`)

      vscodeApi.$toast('脚本生成成功 可运行上方命令执行')
      vscodeApi.$toast(`ENTRY=${storeFolderName}/${platform}/${country}.ts npm run start`)
    } catch (error) {
      vscodeApi.$toast().err("执行失败 错误原因见OUTPUT面板日志");
      vscodeApi.log(error.message);
    }

  },
};
