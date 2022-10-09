let name = "iframe";
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);
const fs = require('fs');
const path = require('path');
let vscode = vscodeApi.vscode;
module.exports = {
    name,
    implementation: function () {
        const html = fs.readFileSync(
            path.join(__dirname, "./freeWindow.html"),
            "utf-8"
        );

        const panel = vscode.window.createWebviewPanel(
            "freewindow.webview",
            "Free-Window",
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
            }
        );
        panel.webview.html = `<html><body>你好，我是Webview<button id="go">百度</button> </body><script>document.querySelector("#go").onclick = () => {
            location.href = "https://www.baidu.com/";
        }</script></html>`
        // panel.webview.html = html;
    },
};
