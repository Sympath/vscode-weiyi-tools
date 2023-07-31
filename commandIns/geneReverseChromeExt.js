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
      // 是否存在background.js并处理成功
      let hasBackground = false;
      /** 拷贝并移动文件及文件夹
       * 
       * @param {*} sourcePath 源
       * @param {*} destinationPath 目标
       * @param {*} handleSpecialFiles
       */
      function copyFolderRecursive(sourcePath, destinationPath, handleSpecialFiles = () => { }) {
        if (!fs.existsSync(destinationPath)) {
          fs.mkdirSync(destinationPath);
        }

        const files = fs.readdirSync(sourcePath);

        files.forEach((file) => {
          // 如果是特殊文件，则交由处理函数处理
          if (handleSpecialFiles(file)) {
            return
          }
          const sourceFile = path.join(sourcePath, file);
          const destinationFile = path.join(destinationPath, file);

          const fileStats = fs.statSync(sourceFile);

          if (fileStats.isDirectory()) {
            copyFolderRecursive(sourceFile, destinationFile);
          } else {
            fs.copyFile(sourceFile, destinationFile, (err) => {
              if (err) {
                vscodeApi.$log('Error copying file:', err);
              } else {
                vscodeApi.$log('File copied successfully.');
              }
            });
          }
        });
      }
      // 1. 复制移动模版仓库 geneReverseChromeExt
      const templateRepoPath = path.join(__dirname, 'geneReverseChromeExt');
      // 2. 将指定路径扩展文件夹下除 background.js 所有文件移动至 public
      const extensionName = await vscodeApi.$showInputBox({
        placeHolder:
          "请输入扩展名",
      });
      let vscodeRootPath = await vscodeApi.getRelativeRootPromise();
      const targetExtensionPath = path.join(vscodeRootPath, extensionName)
      const targetPublicFolder = path.join(targetExtensionPath, 'public');
      const targetSrcFolderPath = path.join(targetExtensionPath, 'src');
      fsExtra.copySync(templateRepoPath, targetExtensionPath);
      // 2. 将指定路径扩展文件夹下除 background.js 所有文件移动至 public
      const extensionFolder = await vscodeApi.$showInputBox({
        placeHolder:
          "请输入扩展文件目录 即版本号那个文件夹的绝对地址",
      });
      // 确保 public 文件夹存在
      // fs.mkdirSync(targetPublicFolder, { recursive: true });


      // 2. 将指定路径扩展文件夹下除 background.js 所有文件移动至 public
      // const backgroundMainAbsPath = await vscodeApi.$showInputBox({
      //   placeHolder:
      //     "请输出此扩展的background.js入口文件相对扩展根目录路径 默认background.js",
      // });
      // chromeOptions.forEach(chromeOption => {
      //   const chromeOptionJs =
      //   const targetJs = path.join(extensionFolder, chromeOptionJs);

      // })
      // 移动除 目标js 以外的所有文件到 public 文件夹

      /** 处理特殊文件
       * 
       * @param {*} file 
       * @returns 
       */
      function handleSpecialFiles(file) {
        // const chromeOptions = ["override-page", "background", "popup", "options", "content-script"];
        const chromeOptions = ["background"];
        let hasTargetJS = chromeOptions.some(chromeOption => `${chromeOption}.js` === file)
        if (hasTargetJS) {
          // 源文件路径
          let sourceFilePath = path.join(extensionFolder, file);
          let content = fs.readFileSync(sourceFilePath, 'utf8');
          // 文件目标路径 默认是src目录下
          let targetFolderPath = targetSrcFolderPath;
          if (file === 'background.js') {
            hasBackground = true
            targetFolderPath = path.join(targetFolderPath, 'background');
          }
          // fs.mkdirSync(backgroundDstFolder, { recursive: true });
          // 读取 background.js 内容，并去掉自执行函数的逻辑
          // 添加 export default
          content = `export default function myBackgroundFunction() {\n${content}\n}`;
          // 将改写后的内容写入 src/background/background.js
          fs.writeFileSync(path.join(targetFolderPath, file), content, 'utf8');
        }
        return hasTargetJS
      }
      copyFolderRecursive(extensionFolder, targetPublicFolder, handleSpecialFiles)
      // 如果没有background.js 提示用户手动重命名为background.js并放在background目录下，并在文件内容外侧加上export default function myBackgroundFunction() {}
      if (!hasBackground) {
        // nodeApi.doShellCmd(`rm -rf ${path.join(targetSrcFolderPath, 'background')}`)
        vscodeApi.$log(`请将background逻辑手动重命名为background.js并放在background目录下，并在文件内容外侧加上export default function myBackgroundFunction() {}`)
      }
      vscodeApi.$toast('扩展对应项目生成成功✅✅✅ 自动安装依赖中，请耐心等待✈️✈️✈️')
      await nodeApi.doShellCmd(`cd ${targetExtensionPath} && npm i`)
      let startCmd = `cd ${extensionName} && npm run build-watch`;
      // vscodeApi.clipboardWriteText(`gac "feat: ${storeFolderName}脚本完成" && gp`)
      vscodeApi.clipboardWriteText(startCmd)
      vscodeApi.$toast('自动安装依赖成功✅✅✅ 启动命令已生成至剪切板 可直接粘贴执行')
    }
    catch (error) {
      vscodeApi.$toast().err("执行失败 错误原因见OUTPUT面板日志");
      vscodeApi.$log(error.message || error.stderr);
    }
  }
}
