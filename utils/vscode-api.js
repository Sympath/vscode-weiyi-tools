const vscode = require("vscode");
const { eachObj } = require(".");
const EditBehaviorHandler = require("./editBehaviorHandler");
const { runCommand, exec, getPackageManageByCommand } = require("./node-api");


// 剪切板相关api
let clipboard = {
  readText() {
    return vscode.env.clipboard.readText();
  },
  writeText(val) {
    return vscode.env.clipboard.writeText(val);
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
  // 选择框 https://geek-docs.com/vscode/vscode-plugin-dev/vscode-plug-in-development-workbench.html
  $quickPick(options) {
    return vscode.window.showQuickPick(options)
    /** 案例
    vscode.window.showQuickPick(['first', 'second', 'third']).then(value => {
      vscode.window.showInformationMessage('User choose ' + value);
    })
    */
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
    // 如果是字符串，说明是处理好后的新内容，直接全文替换
    if (typeof matchMaps === "string") {
      newDocumentText = matchMaps;
    } else {
      matchMaps.forEach((matchMap) => {
        let { oldText, newText } = matchMap;
        // debugger
        newDocumentText = newDocumentText.replace(oldText, newText);
      });
    }
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
  /**
   * 执行全局npm包的命令，没有依赖的时候提醒安装
   * @param {*} npmPackageCommand 命令 
   */
  async runGlobalCommand(npmPackageCommand) {
    // 获取命令
    let commandWithoutParams = npmPackageCommand.split(' ')[0]
    let commnandOut = '' // 命令的输出
    try {
      // 执行命令
      commnandOut = await exec(npmPackageCommand);
    } catch (error) {
      // 如果不是依赖未安装的错误，就默认报出来即可
      if (error.stderr.indexOf('command not found') === -1) {
        this.$toast().err(packageManageErr)
        return
      }
      // 如果是依赖未安装，尝试自动安装
      let packageManage
      try {
        // 获取命令对应依赖的包管理器
        packageManage = getPackageManageByCommand(commandWithoutParams)
      } catch (packageManageErr) {
        this.$toast().err(packageManageErr.message || packageManageErr)
        return
      }
      await this.installPackageGlobal(packageManage, commandWithoutParams, true);
      commnandOut = await exec(npmPackageCommand);
    }
    return commnandOut
  }
  /**
   * 安装全局命令
   * @param {*} npmPackage 
   * @param {*} continueExec 是否自动继续执行命令 
   */
  async installPackageGlobal(packageManager, npmPackage, continueExec = false) {
    let result = await this.$confirm(`依赖缺失，是否安装 ${npmPackage} `, 'yes', 'no')
    let continueTip = '';// 安装完成后的提示语
    let globalOption = {
      npm: ["install", "-g"],
      yum: ["install"],
      brew: ["install"],
    }
    if (result === "yes") {
      // 其它操作
      const options = [...globalOption[packageManager], npmPackage];
      try {
        this.$toast(`正在全局安装${npmPackage}，请稍等`)
        await runCommand(packageManager, options)
        if (continueExec) {
          continueTip = '安装成功，自动继续执行命令'
        } else {
          continueTip = '安装成功'
        }
        this.$toast(continueTip)
      } catch (error) {
        this.$toast().err('安装失败' + error)
      }
    } else if (result === "no") {
    }
  }
  /** 触发需要修改当前document的api
   */
  emit() {
    this.editBehaviorHandler.emit();
  }
}
module.exports = VscodeApi;
