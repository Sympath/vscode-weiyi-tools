const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const fs = require("fs");
// Generate pages object
const pagesObj = {};
let entry = {};
let commonPlugins = [
  // {
  //   from: 'src/manifest.json',
  //   to: 'manifest.json',
  //   transform: content => {
  //     const jsonContent = JSON.parse(content);
  //     // jsonContent.version = version;

  //     if (process.env.NODE_ENV !== "production") {
  //       jsonContent['content_security_policy'] = "script-src 'self' 'unsafe-eval'; object-src 'self'";
  //     }

  //     return JSON.stringify(jsonContent, null, 2);
  //   }
  // }
]
const chromeOptions = ["override-page", "background", "popup", "options", "content-script"];
// 考虑到脚手架选择时会删除一些文件夹 对chrome配置项的处理
chromeOptions.forEach(name => {
  let chromePages = ["override-page", "popup", "options", "content-script"]
  let isExist = fs.existsSync(path.resolve(__dirname, `src/${name}`))
  // console.log('name: ', name, isExist);
  if (isExist) {
    if (name === 'background') {
      entry.background = "./src/background/main.js"
    }
    // 如果content-script存在 需要额外添加其他配置
    if (name === 'content-script') {
      commonPlugins.push(
        { from: 'src/content-script/cs-init.js', to: 'content-script/cs-init.js' },
      )
      commonPlugins.push({ from: 'src/content-script/content-script.css', to: 'content-script/content-script.css' })
    }
    if (chromePages.includes(name)) {
      pagesObj[name] = {
        entry: `src/${name}/index.js`,
        template: "public/index.html",
        filename: `${name}.html`
      };
    }

  }
});
// console.log('commonPlugins', commonPlugins);
module.exports = {
  pages: pagesObj,
  configureWebpack: {
    entry,
    output: {
      filename: "js/[name].js"
    },
    plugins: [CopyWebpackPlugin(commonPlugins)]
  }
};
