const path = require("path");
let name = "initConfig";
const { typeCheck } = require("../utils/index");
const nodeUtils = require("../utils/node-api");
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);

module.exports = {
    name,
    implementation: async function () {
        let Workspace = vscodeApi.vscode.workspace;
        const folders = Workspace.workspaceFolders;
        let fileMap = {
            "formatOnSave": {
                path: '.vscode/settings.json',
                content: `
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
`
            },
            'es6Debugger': {
                path: '.vscode/launch.json',
                content: `
{
  // 使用 IntelliSense 了解相关属性。
  // 悬停以查看现有属性的描述。
  // 欲了解更多信息，请访问: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "program": "${file}",
      "runtimeExecutable": "babel-node"
    }
  ]
}
`
            },
            'git': {
                path: '.gitignore',
                content: `
/node_modules

/**/node_modules

/**/build
/**/dist/
# misc
.DS_Store

npm-debug.log*`
            },
            'train': [
                {
                    path: '',
                    content: ``
                }
            ]

        };
        let options = [
            'formatOnSave',
            "git"
        ]
        let choose = await vscodeApi.$quickPick(options)
        folders.forEach(async (folder) => {
            // 获取当前工作区目录
            let info = fileMap[choose];
            if (typeCheck('String')(fileMap[choose])) {
                info = {
                    path: 'choose',
                    content: fileMap[choose]
                }
            }
            let filePath = path.join(folder.uri.fsPath, info.path)
            let {
                content,
                path: fileName
            } = info;
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
    },
};
