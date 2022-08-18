let name = "renamePic";
const VscodeApi = require("../utils/vscode-api");
const glob = require('glob');
const fs = require('fs');
const { shell, exec } = require("../utils/node-api");
let vscodeApi = new VscodeApi(name);
const path = require('path')
const open = require('open');
const { typeCheck, eachObj } = require("../utils/index");


module.exports = {
    name,
    implementation: async function (url) {
        shell.cd(url.path);
        let images = glob.sync('./*.{gif,png,jpg,JPG}');
        for (let index = 0; index < images.length; index++) {
            let imgName = images[index];
            if (imgName.startsWith('./')) {
                imgName = imgName.replace('./', '');
                let [name, suffix] = imgName.split('.')
                suffix = suffix.toLocaleLowerCase();
                let newName = `${index + 1}.${suffix}`
                fs.rename(imgName, newName, function (err) {
                    if (err) throw err;
                    console.log('File Renamed.');
                })
            }
        }
    },
};
