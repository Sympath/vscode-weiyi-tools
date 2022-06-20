let fs = require("fs");
let Path = require("path");
let NovelTreeItem = require("./NovelTreeItem");
let LocalNovelsPath = `/Users/wzyan/Documents/selfspace/my-study-repos/vscode-plugin-sty/weiyi-tools/libs`;

module.exports = class DataProvider {
  // 提供单行的UI展示
  getTreeItem(info) {
    return new NovelTreeItem(info);
  }
  // 提供每一行的数据
  getChildren() {
    return getLocalBooks();
  }
};
function getLocalBooks() {
  const files = fs.readdirSync(LocalNovelsPath);
  const loaclnovellist = [];
  files.forEach((file) => {
    const extname = Path.extname(file).substr(1);
    if (extname === "txt") {
      const name = Path.basename(file, ".txt");
      const path = Path.join(LocalNovelsPath, file);
      loaclnovellist.push({
        path,
        name,
      });
    }
  });
  return Promise.resolve(loaclnovellist);
}
