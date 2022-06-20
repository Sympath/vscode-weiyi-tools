const glob = require("glob");
// 利用glob实现自动引入所有命令实现
const files = glob.sync(`${__dirname}/*.js`, { ignore: "**/index.@(js|jsc)" });
const controllers = {};
files.forEach((key) => {
  const name = key.split("/").pop().replace(/\.js/g, "");
  const value = require(key);

  controllers[name] = value;
});
module.exports = controllers;
