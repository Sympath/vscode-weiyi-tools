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
module.exports = function () {
  this.$toast('自定义啊211')
  let result = toCamel(this.selectText);
  this.replaceSelectText(result);
  this.emit();
}
