let name = "delComment";
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);

module.exports = {
  name,
  implementation: function () {
    let matchMaps = [
      {
        oldText: /((\/\*([\w\W]+?)\*\/)|(\/\/(.(?!"\)))+)|(^\s*(?=\r?$)\n))/gm,
        newText: "",
      },
      { oldText: /(^\s*(?=\r?$)\n)/gm, newText: "" },
      { oldText: /\\n\\n\?/gm, newText: "" },
    ];
    vscodeApi.replaceDocument(matchMaps);
    vscodeApi.emit();
  },
};
