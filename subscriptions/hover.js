const vscode = require("vscode");
module.exports = vscode.languages.registerHoverProvider("javascript", {
    provideHover: (document, position) => {
        return new vscode.Hover(new vscode.MarkdownString(`![](${url})`));
    }
})