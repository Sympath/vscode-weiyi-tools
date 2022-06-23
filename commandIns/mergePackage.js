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
        // if (!content.startsWith(".")) {
        //   return;
        // }
        let targetJson = {};
        try {
          targetJson = JSON.parse(content);
        } catch (error) {
          vscodeApi.$toast().err("剪切板内容非合法JSON字符串");
          return;
        }
        let sourceJson;
        try {
          sourceJson = JSON.parse(vscodeApi.currentDocumentText);
        } catch (error) {
          vscodeApi.$toast().err("当前文档内容为非合法JSON字符串");
          return;
        }
        let handleProps = ["devDependencies", "dependencies"];
        handleProps.forEach((propName) => {
          Object.assign(sourceJson[propName], targetJson[propName]);
        });
        try {
          vscodeApi.replaceDocument(JSON.stringify(sourceJson));
        } catch (error) {
          vscodeApi.$toast().err("处理后结果非合法JSON字符串");
          return;
        }
        vscodeApi.emit();
      });
    } catch (error) {
      vscodeApi.$toast().err(error);
    }
  },
};
