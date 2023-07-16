let name = "mySinpest";
const { typeCheck } = require("../utils");
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);
const vscode = vscodeApi.vscode;

//  w-todo 这里改成服务端返回
let snippestMap = {
  "no-param": "# ${1: 这里是函数功能}\n# @return ${4: 变量名} ${5: 变量含义}",
  prop_length: (vari) => {
    let handleText = "${#innerArr[@]}";
    if (vari) {
      handleText = `len=${handleText.replace("innerArr", vari)}`;
    }
    return handleText;
  },
};
const dictionary = Object.keys(snippestMap);
const triggers = ["."];
// const COMMAND_NAME = 'mySinpest';
const LANGUAGES = ["shellscript"];

function getCompListByText(opts, position) {
  const range = new vscode.Range(
    new vscode.Position(position.line + 1, 0),
    position
  );
  let [vari, keyWord] = opts;
  let prop = false; // 是不是形如arr.的形式
  if (opts.length === 1) {
    keyWord = vari;
    vari = "";
  } else if (opts.length === 2) {
    prop = true;
  }
  function match(item) {
    // if (prop) {
    //     return (new RegExp(`.${keyWord}`)).test(item)
    // } else {
    //     return item.startsWith(keyWord)
    // }
    return item.startsWith(keyWord);
  }
  let completionItems = dictionary
    .filter((item) => match(item))
    .map((item, idx) => ({
      label: item,
      preselect: idx === 0,
      documentation: "微医shell 智能提示",
      sortText: `my_completion_${idx}`,
      insertText: getSnippest(vari, item),
      // range
      // command: {
      //   arguments: [text],
      //   command: `weiyi-tool.${ COMMAND_NAME } `,
      //   title: 'choose item'
      // },
    }));
  // debugger
  return completionItems;
}
/** 根据关键词返回对应的snippet
 *
 * @param {*} snippestKey
 * @returns
 */
function getSnippest(vari, snippestKey) {
  let snippest = snippestMap[snippestKey];
  if (typeCheck("Function")(snippestMap[snippestKey])) {
    snippest = snippestMap[snippestKey](vari);
  }
  return new vscode.SnippetString(snippest);
}
// 自动补全
module.exports = vscode.languages.registerCompletionItemProvider(
  LANGUAGES,
  {
    provideCompletionItems(document, position, token, context) {
      const range = new vscode.Range(
        new vscode.Position(position.line, 0),
        position
      );
      const text = document.getText(range);
      // debugger
      const completionItemList = getCompListByText(text.split("."), position);
      // vscodeApi.deleteByRange(range).emit()
      return completionItemList;
    },
  },
  "."
);
