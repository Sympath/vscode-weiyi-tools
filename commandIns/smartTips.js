let name = "smartTips";
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);
let vscode = vscodeApi.vscode;

module.exports = {
    name,
    type: 'textEditorCommand',
    implementation: async (editor, edit, position, vari) => {
        // const lineText = editor.document.lineAt(position.line).text
        // const index = lineText.indexOf(vari)
        // edit.delete(new vscode.Range(position.with(undefined, index), position.with(undefined, index + vari.length)))
        // edit.insert(position.with(undefined, index), insertVal)
        vscodeApi.deleteByText(vari, position.line).emit()
        return Promise.resolve([])
    }
};
