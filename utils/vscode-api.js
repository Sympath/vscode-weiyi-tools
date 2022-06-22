const vscode = require("vscode");
const { eachObj } = require(".");
const EditBehaviorHandler = require("./editBehaviorHandler");

// 剪切板相关api
let clipboard = {
  readText() {
    return vscode.env.clipboard.readText();
  },
};
// 一些挂载的属性，方便获取
let defineProps = {
  // 光标选中的文本
  selectText() {
    // 拿到当前编辑页面的内容对象 editor
    const editor = vscode.window.activeTextEditor;
    // 拿到光标选中的文本并格式化
    const selection = editor.selection;
    const text = editor.document.getText(selection);
    return text;
  },
  // 当前的document对象
  currentDocument() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const document = editor.document;
    return document;
  },
  // 当前打开文档的内容
  currentDocumentText() {
    const documentText = this.currentDocument.getText();
    return documentText;
  },
};

class VscodeApi {
  constructor(name) {
    this.editBehaviorHandler = new EditBehaviorHandler(name);
    this.clipboard = clipboard;
    this.vscode = vscode;
    //
    eachObj(defineProps, (propName, get) => {
      // 光标选中的内容
      Object.defineProperty(this, propName, {
        get: get.bind(this),
      });
    });
  }
  $toast(content) {
    // success warning error
    let type = "";
    let api = "showInformationMessage";
    let message = content;
    if (typeof content === "object") {
      type = content.type;
    }
    if (type === "error") {
      api = "showErrorMessage";
    }
    if (content) {
      vscode.window[api](message);
    }
    return {
      err(msg) {
        vscode.window.showErrorMessage(msg);
      },
    };
  }
  $confirm(...params) {
    /**
     vscode.window
      .showInformationMessage("是否热爱前端", "是", "否", "不再提示")
      .then((result) => {
        if (result === "是") {
          // 其它操作
        } else if (result === "不再提示") {
          // 其它操作
        }
      });
     */
    return vscode.window.showInformationMessage(...params);
  }
  /** 替换内容，需要emit触发
   *
   * @param {*} oldText
   * @param {*} newText
   * @param {*} replaceAll 全文替换模式 默认true
   * @returns editBehaviorHandler
   */
  replaceText(oldText, newText, replaceAll = true) {
    let editBehaviorHandler = this.editBehaviorHandler;
    let documentText = this.currentDocumentText;
    let replaceStatements = [];
    // 检测console的正则表达式
    let mode = "";
    if (replaceAll) {
      mode = "g";
    }
    const textRegex = new RegExp(oldText, mode);
    let match;
    // 正则循环匹配页面文本
    while ((match = textRegex.exec(documentText))) {
      // 每次匹配到当前的范围--Range
      let matchRange = new vscode.Range(
        document.positionAt(match.index),
        document.positionAt(match.index + match[0].length)
      );
      // let line = document.line;
      if (!matchRange.isEmpty)
        // 把Range放入数组
        replaceStatements.push({
          range: matchRange,
          newText: typeof newText === "function" ? newText(match) : newText,
        });
    }
    // 循环遍历每个匹配项的range，并删除
    replaceStatements.forEach((replaceItem) => {
      let { range, newText } = replaceItem;
      editBehaviorHandler.add("replace", range, newText);
    });
    return editBehaviorHandler;
  }
  /** 多匹配规则的全文替换 需要emit触发
   *
   * @param {*} matchMaps
   */
  replaceDocument(matchMaps = []) {
    let editBehaviorHandler = this.editBehaviorHandler;
    let text = this.currentDocumentText;
    let newDocumentText = text;
    matchMaps.forEach((matchMap) => {
      let { oldText, newText } = matchMap;
      // debugger
      newDocumentText = newDocumentText.replace(oldText, newText);
    });
    // 全量替换当前页面文本
    const end = new vscode.Position(this.currentDocument.lineCount + 1, 0);
    editBehaviorHandler.add(
      "replace",
      new vscode.Range(new vscode.Position(0, 0), end),
      newDocumentText
    );
  }
  /** 替换当前选中的内容 需要emit触发
   *
   * @param {*} newVal 新的内容
   * @returns
   */
  replaceSelectText(newVal) {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    let selection = editor.selection;
    this.editBehaviorHandler.add("replace", selection, newVal);
  }
  /** 插入内容，默认插入到首行首列 需要emit触发
   *
   * @param {*} val
   * @param {*} line 行
   * @param {*} startCharacter 列
   */
  insertText(val, line = 0, startCharacter = 0) {
    let editBehaviorHandler = this.editBehaviorHandler;
    // edit方法获取editBuilder实例，在后一行添加
    let startLine = line;

    editBehaviorHandler.add(
      "insert",
      new vscode.Position(startLine, startCharacter),
      val
    );
  }
  /** 插入内容至当前选中行的下一行 需要emit触发
   *
   * @param {*} val
   */
  insertTextToNextLine(val) {
    const editor = vscode.window.activeTextEditor;
    const selection = editor.selection;
    // 获取光标当前行
    const lineOfSelectedVar = selection.active.line;
    // edit方法获取editBuilder实例，在后一行添加
    // 插入的内容添加颜色
    // let decorationType = vscode.window.createTextEditorDecorationType({
    //   color: "yellow",
    // });
    let startLine = lineOfSelectedVar + 1;
    this.insertText(val, startLine);
    // let endLine = lineOfSelectedVar + 1;
    // let startCharacter = 0;
    // let endCharacter = val.length - 1;
    // setTimeout(() => {
    //   editor.setDecorations(decorationType, [
    //     new vscode.Range(startLine, startCharacter, endLine, endCharacter),
    //   ]);
    // }, 0);
  }
  /** 触发需要修改当前document的api
   */
  emit() {
    this.editBehaviorHandler.emit();
  }
}
module.exports = VscodeApi;
