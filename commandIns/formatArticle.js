let name = "formatArticle";
const VscodeApi = require("../utils/vscode-api");
const nodeApi = require("../utils/node-api");
let vscodeApi = new VscodeApi(name);
const { C_FORMAT_ARTICLE_DIR } = require("../config/variable.js");
module.exports = {
  name,
  implementation: async function () {
    let DEFAULT_CONFIG = {
      theme: `---
theme: cyanosis
highlight: atom-one-dark
---
`,
      head: "",
      introduce: `
> 王志远，微医前端技术部
`,
    };
    let replaceItems = [
      {
        oldText: /([\u4e00-\u9fa5]+)([\da-zA-Z]+)/g,
        newText: "$1 $2",
      },
      {
        oldText: /([\da-zA-Z]+)([\u4e00-\u9fa5]+)/g,
        newText: "$1 $2",
      },
      {
        oldText: /!\[.+\]/g,
        newText: "![]",
      },
    ];
    vscodeApi.replaceDocument(replaceItems);
    let absPath = vscodeApi.getAbsPathByRelativeRootSync(C_FORMAT_ARTICLE_DIR);
    let articleConfig = {};
    let articleConfigs = [];
    if (absPath) {
      articleConfigs = nodeApi.getFileExportObjInDir(absPath);
    }
    let options = Object.keys(articleConfigs);
    if (options.length === 1) {
      articleConfig = options[0];
    } else {
      let choose = await vscodeApi.$quickPick(options);
      if (!choose) {
        return;
      }
      articleConfig = articleConfigs[choose];
    }
    let finnalConfig = Object.assign(DEFAULT_CONFIG, articleConfig);
    let { theme, head, introduce } = finnalConfig;
    vscodeApi.insertText(theme);
    vscodeApi.insertText(head);
    vscodeApi.insertText(introduce);
    vscodeApi.emit();
    // 引导用户阅读文档
    let needGo = await vscodeApi.$confirm(`需要看发文流程文档不`, "去呀");
    if (needGo === "去呀") {
      vscodeApi.open(
        "https://confluence.guahao-inc.com/pages/viewpage.action?pageId=101982076"
      );
    }
  },
};
