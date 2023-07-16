let name = "upload-custom";
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);
let vscode = vscodeApi.vscode;
const path = require("path");
const open = require("open");
const { typeCheck, eachObj } = require("../utils/index");
const { ACCESS_DOCUMENT_URL, customFolder } = require("../config/variable.js");
const nodeUtils = require("../utils/node-api");
let { getFileExportObjInDir } = nodeUtils;
let UPLOAD_CUSTOM_MIDDLE_DIR = "upload-custom-middle";

module.exports = {
  name,
  implementation: async function (...params) {
    let customTypes = Object.keys(customFolder).map((item) => ({
      label: customFolder[item].key,
      ...customFolder[item].quickPickItem,
    }));
    let chooseItem = await vscodeApi.$quickPick(customTypes);
    if (!chooseItem) {
      return;
    }
    let { label: customType } = chooseItem;
    // 自定义snippet的仓库地址
    let { userDir, key, appDir, modelContent } = customFolder[customType];
    let customDirPath = path.resolve(__dirname, appDir);
    // 自定义命令集合
    let options = [];
    // 自定义命令和对应实现
    let collectors = {};
    let middle = []; // 内部中间件
    let absAppDir = ""; // 拼接上项目根目录，自定义目录的绝对路径
    // 收集下内部中间件
    try {
      middle = getFileExportObjInDir(
        path.resolve(__dirname, `./${UPLOAD_CUSTOM_MIDDLE_DIR}`),
        "js",
        {
          removeRequireCache: true,
          needAbsPath: true,
        }
      );
      collectors = Object.assign(collectors, middle);
    } catch (error) {
      vscodeApi.$toast().err(error);
    }
    // 看本地是否有实现命令
    try {
      // 初始化自定义命令
      vscodeApi.getAbsPathByRelativeRoot(userDir, (absPath) => {
        absAppDir = absPath;
        // 获取项目根目录下的自定义命令
        let rootDirCollectors = getFileExportObjInDir(absPath, "js", {
          removeRequireCache: true,
          needAbsPath: true,
        });
        collectors = Object.assign(collectors, rootDirCollectors);
      });
    } catch (error) {
      vscodeApi.$toast().err(error);
    }
    eachObj(collectors, (name, implementation) => {
      let {
        quickPickItem = {},
        uploaded = () => {},
        beforeUpload = () => {},
        _absPath, // 对应文件的绝对路径
      } = implementation;
      if (typeCheck("Undefined")(quickPickItem.label)) {
        quickPickItem.label = name;
      }
      if (typeCheck("Undefined")(quickPickItem.order)) {
        quickPickItem.order = 9999;
      }
      options.push({
        ...quickPickItem,
      });
      let vscodeApi = new VscodeApi(name);
      let pathInfo = {
        absAppDir,
        customDirPath,
      };
      let context = {
        vscodeApi,
        nodeUtils,
        collectors,
        pathInfo,
        key,
      };
      // 上传前的回调
      collectors[quickPickItem.label].beforeUpload = (...params) => {
        beforeUpload.call(context, ...params);
        vscodeApi.emit();
      };
      // 上传后的回调
      collectors[quickPickItem.label].uploaded = (...params) => {
        uploaded.call(context, ...params);
        vscodeApi.$toast(`上传完成，删掉文件试试叭~`);
        vscodeApi.emit();
      };
    });

    if (options.length - Object.keys(middle).length > 0) {
      options.sort((a, b) => a.order - b.order);
      let choose = await vscodeApi.$quickPick(options);
      let chooseLabel = choose && choose.label;
      if (!chooseLabel) {
        return;
      }
      let { uploaded, _absPath, beforeUpload } = collectors[chooseLabel];
      let noNeedUpload = false;
      // 上传后的回调执行
      if (typeCheck("Function")(beforeUpload)) {
        // 是否不需要上传 默认是false
        noNeedUpload = beforeUpload(...params);
      }
      // 需要上传时才上传 中间件支持取消上传动作
      if (noNeedUpload) {
        // 这里用scp命令上传至服务器同步 w-todo 先展示放在mac的插件本地 用cp命令
        let uploadCmd = `cp ${_absPath} ${customDirPath}`;
        await nodeUtils.doShellCmd(uploadCmd);
        // 上传后的回调执行
        if (typeCheck("Function")(uploaded)) {
          uploaded(...params);
        }
      }
    } else {
      let result = await vscodeApi.$confirm(
        `暂无自定义${key}，快根据文档实现自己的${key}吧！`,
        "帮我创建模板"
      );
      if (result === "帮我创建模板") {
        // 这里创建对应的目录和模板
        await nodeUtils.doShellCmd(`mkdir ${absAppDir}`);
        await nodeUtils.writeFileRecursive(
          `${absAppDir}/模板.js`,
          modelContent
        );
        // 引导用户阅读文档
        vscodeApi.runVscodeCommand("weiyi-tool.goDocs");
      }
    }
  },
};
