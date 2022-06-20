let { TreeItem } = require("vscode");

module.exports = class NovelTreeItem extends TreeItem {
  constructor(info) {
    super(`${info.name}`);

    const tips = [`名称:　${info.name}`];

    // tooltip是悬浮的条提示
    this.tooltip = tips.join("\r\n");
    // 我们设置一下点击该行的命令，并且传参进去
    this.command = {
<<<<<<< HEAD
      command: "weiyi-tools.openSelectedNovel",
=======
      command: "edit-article.openSelectedNovel",
>>>>>>> 1177eea8b192d88705c33177912920b2b881c53e
      title: "打开该小说",
      arguments: [{ name: info.name, path: info.path }],
    };
  }
};
