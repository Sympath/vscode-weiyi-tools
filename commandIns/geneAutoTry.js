let name = "geneAutoTry";
const VscodeApi = require("../utils/vscode-api");
const nodeApi = require("../utils/node-api");
let vscodeApi = new VscodeApi(name);

module.exports = {
  name,
  implementation: async function () {
    try {
      let storeName = await vscodeApi.$showInputBox({
        placeHolder:
          "请输入店铺名",
      });
      let storeID = await vscodeApi.$showInputBox({
        placeHolder:
          "请输入店铺ID",
      });
      let platform = await vscodeApi.$showInputBox({
        placeHolder:
          "请输入平台 默认web",
        value: "web",
      });
      let country = await vscodeApi.$showInputBox({
        placeHolder:
          "请输入国家缩写 默认us",
        value: "us",
      });
      vscodeApi.$toast('开始生成...')
      let vscodeRootPath = await vscodeApi.getRelativeRootPromise();
      let folderPath = `${vscodeRootPath}/src/stores/${storeName}`
      await nodeApi.doShellCmd(`mkdir ${folderPath}`);
      let platformFolderPath = `${folderPath}/${platform}/`
      await nodeApi.doShellCmd(`mkdir ${platformFolderPath}`);
      let metaStr = `
[
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

      vscodeApi.$toast('脚本生成成功...')
    } catch (error) {
      vscodeApi.$toast().err("执行失败 错误原因见OUTPUT面板日志");
      vscodeApi.log(error.message);
    }

  },
};
