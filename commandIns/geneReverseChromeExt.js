let name = "geneReverseChromeExt";
const fs = require("fs");
// 使用 fs-extra 模块的 copySync 方法复制目录
const fsExtra = require('fs-extra');
const path = require('path');
const { promisify } = require('util');
const VscodeApi = require("../utils/vscode-api");
const nodeApi = require("../utils/node-api");
let vscodeApi = new VscodeApi(name);
const os = require('os');

// 获取用户主目录的绝对路径
const homeDirectory = os.homedir();



/**
 * 1. 复制移动模版仓库 geneReverseChromeExt
 * 2. 将指定路径扩展文件夹下除background.js所有文件移动至public
 * 3. 将background.js改写成export defaut模式并移动至src/background
 */
module.exports = {
  name,
  implementation: async function () {
    try {
      function findDirectoriesWithSubdir(basePath, subDirName) {
        try {
          let result = ''
          // 读取指定目录下的所有文件和文件夹
          const filesAndDirs = fs.readdirSync(basePath);

          // 遍历每个文件或文件夹
          filesAndDirs.forEach(fileOrDir => {
            const filePath = path.join(basePath, fileOrDir);

            // 判断是否是文件夹
            const isDirectory = fs.statSync(filePath).isDirectory();

            if (isDirectory) {
              // 判断文件夹是否包含指定子目录
              const subDirPath = path.join(filePath, subDirName);
              if (fs.existsSync(subDirPath) && fs.statSync(subDirPath).isDirectory()) {
                result = subDirPath
              }
            }
          });
          if (result) {
            return result
          }
          throw new Error('扩展查找失败 请确定')

        } catch (err) {
          console.error('Error finding directories:', err);
        }
      }
      function readManifestFile(dirPath) {
        try {
          const manifestPath = path.join(dirPath, 'manifest.json');

          // 读取 manifest.json 文件内容
          const manifestData = fs.readFileSync(manifestPath, 'utf8');

          // 将 JSON 字符串解析为 JSON 对象
          const manifestObj = JSON.parse(manifestData);

          return manifestObj;
        } catch (err) {
          console.error('Error reading manifest.json:', err);
          return null;
        }
      }
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
          const sourceFile = path.join(sourcePath, file);
          const destinationFile = path.join(destinationPath, file);

          const fileStats = fs.statSync(sourceFile);

          if (fileStats.isDirectory()) {
            copyFolderRecursive(sourceFile, destinationFile);
          } else {
            // 如果是特殊文件，则交由处理函数处理
            if (handleSpecialFiles(file)) {
              return
            }
            fs.copyFile(sourceFile, destinationFile, (err) => {
              if (err) {
                vscodeApi.$log('Error copying file:', err);
              } else {
              }
            });
          }
        });
      }
      function modifyFile(filePath, targetString, replacement) {
        try {
          // 读取文件内容
          const fileContent = fs.readFileSync(filePath, 'utf8');

          // 使用正则表达式替换目标字符串为指定的替换内容
          const modifiedContent = fileContent.replace(new RegExp(targetString, 'g'), replacement);

          // 将修改后的内容保存回原文件
          fs.writeFileSync(filePath, modifiedContent, 'utf8');

          console.log(`File "${filePath}" has been modified.`);
        } catch (err) {
          console.error('Error modifying file:', err);
        }
      }
      let extenBaseUrl = `${homeDirectory}/Library/Application\ Support/Google/Chrome/Default/Extensions/`
      // 是否存在background.js并处理成功
      let hasBackground = false;
      const extensionName = await vscodeApi.$showInputBox({
        placeHolder:
          "请输入扩展名",
      });
      let extensionFolder = await vscodeApi.$showInputBox({
        placeHolder:
          "请输入扩展文件目录 即版本号那个文件夹的绝对地址 或者只提供版本号也可以",
      });
      // 如果只提供版本 就自行查找下
      if (extensionFolder.indexOf('Default/Extensions/') === -1) {
        extensionFolder = findDirectoriesWithSubdir(extenBaseUrl, extensionFolder)
      }
      // 1. 复制移动模版仓库 geneReverseChromeExt
      const templateRepoPath = path.join(__dirname, 'geneReverseChromeExt');
      let vscodeRootPath = await vscodeApi.getRelativeRootPromise();
      const targetExtensionPath = path.join(vscodeRootPath, extensionName)
      const targetExtensionVueConfigFilePath = path.join(targetExtensionPath, 'vue.config.js')
      const targetBackgroundMainFilePath = path.join(targetExtensionPath, 'src/background/main.js')
      const targetPublicFolder = path.join(targetExtensionPath, 'public');
      const targetSrcFolderPath = path.join(targetExtensionPath, 'src');
      fsExtra.copySync(templateRepoPath, targetExtensionPath);
      // 2. 修改vue.config.js 指定background输出文件名
      let manifestObj = readManifestFile(extensionFolder)
      if (!manifestObj) {
        vscodeApi.$toast().err('未找到扩展')
      }
      const backgroundScriptName = manifestObj.background.service_worker || manifestObj.background.scripts[0]
      modifyFile(targetExtensionVueConfigFilePath, 'background-placeHolder', backgroundScriptName.split('.')[0])
      modifyFile(targetBackgroundMainFilePath, 'background-placeHolder', backgroundScriptName.split('.')[0])
      // 3. 将指定路径扩展文件夹下除 background.js 所有文件移动至 public
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
        // 源文件路径
        let sourceFilePath = path.join(extensionFolder, file);
        let content = fs.readFileSync(sourceFilePath, 'utf8');
        // 文件目标路径 默认是src目录下
        let targetFolderPath = targetSrcFolderPath;
        if (file === backgroundScriptName) {
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
