const { getFilesInDir } = require("../utils/node-api");
let collector = getFilesInDir(__dirname, {
  ignore: "**/index.@(js|jsc)",
});
module.exports = collector;
