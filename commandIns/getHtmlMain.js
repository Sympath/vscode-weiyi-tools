let name = "getHtmlMain";
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);
const nodeApi = require("../utils/node-api");
module.exports = {
    name,
    implementation: async function (url) {
        nodeApi.cd(url.path);
        let getAllHtmlCmd = `ls | grep html`
        let { stdout } = await nodeApi.doShellCmd(getAllHtmlCmd)
        let htmlArr = stdout.split('\n').filter(s => s);
        let getHtmlMainContent = htmlArr.map(html => `<a href="./${html}">${html}</a>`).join('\n')
        nodeApi.writeFileRecursive('./getHtmlMain.html', getHtmlMainContent)
    },
};
