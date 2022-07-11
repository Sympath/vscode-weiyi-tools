const { getFileExportObjInDir } = require("../utils/node-api");
let collector = getFileExportObjInDir(__dirname, 'js', {
  globOpts: {
    ignore: "**/index.@(js|jsc)",
  }
});
module.exports = collector;
