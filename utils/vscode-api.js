const vscode = require("vscode");

function $toast(content) {
  // success warning error
  let type = "";
  let api = "showInformationMessage";
  let message = content;
  if (typeof content === "object") {
    type = content.type;
  }
  if (type === "error") {
    api = "showErrorMessage";
  }
  if (content) {
    vscode.window[api](message);
  }
  return {
    err(msg) {
      vscode.window.showErrorMessage(msg);
    },
  };
}

function $confirm(...params) {
  return vscode.window.showInformationMessage(...params);
}

let clipboard = {
  readText() {
    return vscode.env.clipboard.readText();
  },
};

module.exports = {
  $toast,
  $confirm,
  clipboard,
};
