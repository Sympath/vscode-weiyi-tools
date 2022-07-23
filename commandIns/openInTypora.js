let name = 'openInTypora';
const VscodeApi = require('../utils/vscode-api');
let vscodeApi = new VscodeApi(name);
let vscode = vscodeApi.vscode;
const os = require("os");

function openInTypora() {
    const terminal = vscode.window.createTerminal({
        name: "Typora",
        hideFromUser: true,
    });
    if (
        !vscode.window.activeTextEditor ||
        !vscode.window.activeTextEditor.document.fileName
    ) {
        vscode.window.showInformationMessage("No active editor or URI available");
        return;
    }

    if (vscode.window.activeTextEditor.document.languageId !== "markdown") {
        vscode.window.showInformationMessage(
            `The file you are trying to open is not in Markdown format!`
        );
        return;
    } else {
        try {
            terminal.sendText(
                // 这里的open命令用于打开软件，此处可以考虑扩展【W-TODO：支持更多应用的打开】
                `${os.type() === "Darwin" ? "open -a " : ""}typora "${vscode.window.activeTextEditor.document.fileName
                }"`
            );

            if (
                vscode.workspace
                    .getConfiguration("openInTypora")
                    .get("showSuccessInformationMessage")
            ) {
                vscode.window.showInformationMessage("Starting Typora");
            }
        } catch (e) {
            vscode.window.showInformationMessage(
                `Failed to open file: ${vscode.window.activeTextEditor.document.fileName} in Typora!`
            );
        }
    }
}
module.exports = {
    name,
    implementation: function () {
        openInTypora()
    },
};