const CopyWebpackPlugin = require("copy-webpack-plugin");
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
entry["background-placeHolder"] = "./src/background/main.js"
// console.log('commonPlugins', commonPlugins);
module.exports = {
  pages: pagesObj,
  configureWebpack: {
    entry,
    output: {
      filename: "[name].js"
    },
    plugins: [CopyWebpackPlugin(commonPlugins)]
  }
};
