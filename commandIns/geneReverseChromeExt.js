let name = "geneReverseChromeExt";
const fs = require("fs");
// 使用 fs-extra 模块的 copySync 方法复制目录
const fsExtra = require('fs-extra');
const path = require('path');
const { promisify } = require('util');
const VscodeApi = require("../utils/vscode-api");
const nodeApi = require("../utils/node-api");
let vscodeApi = new VscodeApi(name);
/**
 * 1. 复制移动模版仓库 geneReverseChromeExt
 * 2. 将指定路径扩展文件夹下除background.js所有文件移动至public
 * 3. 将background.js改写成export defaut模式并移动至src/background
 */
module.exports = {
  name,
  implementation: async function () {
    try {
      // 1. 复制移动模版仓库 geneReverseChromeExt
      const templateRepoPath = path.join(__dirname, 'geneReverseChromeExt');
      // 2. 将指定路径扩展文件夹下除 background.js 所有文件移动至 public
      const extensionName = await vscodeApi.$showInputBox({
        placeHolder:
          "请输入扩展名",
      });
      let vscodeRootPath = await vscodeApi.getRelativeRootPromise();
      const targetFolderPath = path.join(vscodeRootPath, extensionName)
      const publicFolder = path.join(targetFolderPath, 'public');
      fsExtra.copySync(templateRepoPath, targetFolderPath);

      // 2. 将指定路径扩展文件夹下除 background.js 所有文件移动至 public
      const extensionFolder = await vscodeApi.$showInputBox({
        placeHolder:
          "请输入扩展文件目录 即版本号那个文件夹的绝对地址",
      });
      // 确保 public 文件夹存在
      fs.mkdirSync(publicFolder, { recursive: true });


      // 2. 将指定路径扩展文件夹下除 background.js 所有文件移动至 public
      const backgroundMainAbsPath = await vscodeApi.$showInputBox({
        placeHolder:
          "请输出此扩展的background.js入口文件相对扩展根目录路径 默认background.js",
      });
      const backgroundJsFile = path.join(extensionFolder, backgroundMainAbsPath || 'background.js');
      // 移动除 background.js 以外的所有文件到 public 文件夹
      fs.readdirSync(extensionFolder).forEach((file) => {
        if (file !== backgroundMainAbsPath) {
          fs.copyFileSync(path.join(extensionFolder, file), path.join(publicFolder, file));
        }
      });
      const srcFolder = path.join(targetFolderPath, 'src');
      const backgroundDstFolder = path.join(srcFolder, 'background');

      // 确保 src/background 文件夹存在
      fs.mkdirSync(backgroundDstFolder, { recursive: true });

      // 读取 background.js 内容，并去掉自执行函数的逻辑
      let content = fs.readFileSync(backgroundJsFile, 'utf8');
      // content = content.replace(/^\(function\s*\(\s*\)\s*\{/, ''); // 去掉自执行函数的开始部分
      // content = content.replace(/\}\)\(\);?$/, ''); // 去掉自执行函数的结束部分

      // 添加 export default
      content = `export default function myBackgroundFunction() {\n${content}\n}`;

      // 将改写后的内容写入 src/background/background.js
      fs.writeFileSync(path.join(backgroundDstFolder, 'background.js'), content, 'utf8');

    } catch (error) {
      vscodeApi.$toast().err("执行失败 错误原因见OUTPUT面板日志");
      vscodeApi.$log(error.message || error.stderr);
    }

  },
};
