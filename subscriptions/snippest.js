
let name = "mySinpest";
const { typeCheck } = require("../utils");
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);
const vscode = vscodeApi.vscode
//  w-todo 这里改成服务端返回 这里只处理【变量.属性】的情况
const snippetMap = require('./snippets');
const COMMAND_NAME = 'mySinpest';

const dictionary = Object.keys(snippetMap);

const LANGUAGES = ['shellscript'];

function getCompListByText(opts, position) {
    const range = new vscode.Range(new vscode.Position(position.line + 1, 0), position);
    let [vari, keyWord] = opts
    let prop = false // 是不是形如arr.的形式
    if (opts.length === 1) {
        keyWord = vari
        vari = ''
    } else if (opts.length === 2) {
        prop = true
    }
    function match(item) {
        // if (prop) {
        //     return (new RegExp(`.${keyWord}`)).test(item)
        // } else {
        //     return item.startsWith(keyWord)
        // }
        return item.startsWith(keyWord)
    }
    let completionItems = dictionary.filter(item => match(item)).map((item, idx) => ({
        label: item,
        preselect: idx === 0,
        documentation: '微医shell 智能提示',
        sortText: `my_completion_${idx}`,
        insertText: getSnippest(vari, item),
        // range
        command: {
            arguments: [position.translate(0, vari.length + 1), `${vari}.`], // 这里可以传递参数给该命令
            command: `weiyi-tools.${COMMAND_NAME}`,
            title: 'choose item'
        },
    }));
    return completionItems
}
/** 根据关键词返回对应的snippet
 * 
 * @param {*} snippestKey 
 * @returns 
 */
function getSnippest(vari, snippestKey) {
    let snippest = snippetMap[snippestKey];
    if (typeCheck('Function')(snippetMap[snippestKey])) {
        snippest = snippetMap[snippestKey](vari)
    }
    return new vscode.SnippetString(snippest);
}
// 自动补全
module.exports = vscode.languages.registerCompletionItemProvider(LANGUAGES, {
    provideCompletionItems(document, position) {
        const range = new vscode.Range(new vscode.Position(position.line, 0), position);
        const text = document.getText(range);
        // debugger
        const completionItemList = getCompListByText(text.split('.'), position)
        // vscodeApi.deleteByRange(range).emit()
        return completionItemList;
    },
    // 光标选中当前自动补全item时触发动作
    resolveCompletionItem(item) {
        return null
    }
}, '.');
