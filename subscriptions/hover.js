
let name = "hover";
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);
const vscode = vscodeApi.vscode
module.exports = vscode.languages.registerHoverProvider("javascript", {
    provideHover: (document, position) => {
        return new vscode.Hover(new vscode.MarkdownString(`![](${url})`));
    }
})