let name = "mySinpest";
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);
const glob = require('glob');
const fs = require('fs');
const { shell, exec } = require("../utils/node-api");
const path = require('path')
const open = require('open');
const { typeCheck, eachObj } = require("../utils/index");


module.exports = {
    name,
    type: 'textEditorCommand',
    implementation: async function (...params) {
        console.log(params);
        debugger
        return 111
    },
};
