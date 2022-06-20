const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
let name = "formatOnSave";
const utils = require("../utils/index");
/** 判断文件是否存在
 *
 * @param {*} filePath
 * @returns
 */
const fileIsExist = async (filePath) => {
  return await fs.promises
    .access(filePath)
    .then(() => true)
    .catch((_) => false);
};
/** 写入文件
 *
 * @param {*} path
 * @param {*} buffer
 * @returns
 */
const writeFileRecursive = function (path, buffer) {
  return new Promise((res, rej) => {
    let lastPath = path.substring(0, path.lastIndexOf("/"));
    fs.mkdir(lastPath, { recursive: true }, (err) => {
      if (err) return rej(err);
      fs.writeFile(path, buffer, function (err) {
        if (err) return rej(err);
        return res(null);
      });
    });
  });
};
module.exports = {
  name,
  implementation: function () {
    let Workspace = vscode.workspace;
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
        let isExist = await fileIsExist(filePath);
        // 判断配置文件是否存在，如果不存在，写入指定内容；如果存在，提示自动生成失败
        if (isExist) {
          vscode.window.showErrorMessage(`${fileName}已存在，自动生成失败`);
        } else {
          writeFileRecursive(filePath, content).then(
            () => {
              vscode.window.showInformationMessage(`${fileName}自动生成成功`);
            },
            (err) => {
              vscode.window.showErrorMessage(`${fileName}自动生成失败，${err}`);
            }
          );
        }
      });
    });
  },
};
