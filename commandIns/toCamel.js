let name = "toCamel";
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);
function toCamel(str) {
  let answer = "";
  answer = str.replace(/([^_])(?:_+([^_]))/g, function ($0, $1, $2) {
    return $1 + $2.toUpperCase();
  });
  answer = answer.replace(/([^-])(?:-+([^-]))/g, function ($0, $1, $2) {
    return $1 + $2.toUpperCase();
  });
  return answer;
}
module.exports = {
  name,
  implementation: function () {
    let result = toCamel(vscodeApi.selectText);
    vscodeApi.replaceSelectText(result);
    vscodeApi.emit();
  },
};
