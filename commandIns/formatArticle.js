let name = "formatArticle";
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);

module.exports = {
  name,
  implementation: function () {
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
    vscodeApi.insertText(`---
theme: cyanosis
highlight: atom-one-dark
---
> 王志远，微医前端技术部
`);
    vscodeApi.emit();
  },
};
