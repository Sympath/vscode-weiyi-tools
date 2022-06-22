const path = require("path");
let name = "formatOnSave";
const utils = require("../utils/index");
const nodeUtils = require("../utils/node-api");
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);

module.exports = {
  name,
  implementation: function () {
    let Workspace = vscodeApi.vscode.workspace;
    const folders = Workspace.workspaceFolders;
    let fileMap = {
      "settings.json": `
{
  	// 支持.vue文件的格式化
    "[vue]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
     // 匹配.tsx文件
    "[javascriptreact]": {
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
     // 匹配.tsx文件
    "[typescriptreact]": {
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
     // 匹配.ts文件
    "[typescript]": {
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "eslint.alwaysShowStatus": true,
    "eslint.format.enable": true,
    "eslint.packageManager": "yarn",
    "eslint.run": "onSave",
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
    },
    "vetur.validation.template": false,
    "editor.formatOnPaste": true,
    "editor.formatOnType": true,
    "editor.formatOnSave": true,
  }
`,
    };

    folders.forEach((folder) => {
      // 获取当前工作区目录
      let vscodeFilePath = `${folder.uri.fsPath}/.vscode`;
      utils.eachObj(fileMap, async (fileName, content) => {
        let filePath = path.join(vscodeFilePath, fileName);
        let isExist = await nodeUtils.fileIsExist(filePath);
        // 判断配置文件是否存在，如果不存在，写入指定内容；如果存在，提示自动生成失败
        if (isExist) {
          vscodeApi.$toast().err(`${fileName}已存在，自动生成失败`);
        } else {
          try {
            await nodeUtils.writeFileRecursive(filePath, content);
            vscodeApi.$toast(`${fileName}自动生成成功`);
          } catch (error) {
            vscodeApi.$toast().err(`${fileName}已存在，自动生成失败，${err}`);
          }
        }
      });
    });
  },
};
