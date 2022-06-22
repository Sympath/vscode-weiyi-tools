let name = "mergePackage";
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);

module.exports = {
  name,
  implementation: function (url) {
    // var { dir } = path.parse(url.path);
    // shell.cd(dir);
    // let content = fs.readFileSync(url.path, "utf-8");
    try {
      let readText = vscodeApi.clipboard.readText();
      readText.then((content) => {
        if (!content.startsWith(".")) {
          return;
        }
        let targetJson = {};
        try {
          let targetJson = JSON.parse(content);
        } catch (error) {
          vscodeApi.$toast().err("剪切板内容非合法JSON字符串");
        }
      });
    } catch (error) {
      vscodeApi.$toast().err(error);
    }
  },
};
