source $HOME/.nvm/nvm.sh
nvm use v14
echo $(node -v)
vsce publish patch
# 更新下在线文档信息
jsdoc utils/node-api.js
jsdoc utils/vscode-api.js
# 发布最新的文档信息 访问http://vscode-extension-api.surge.sh/global.html#fileIsExist即可查看
surge teardown vscode-extension-api.surge.sh
surge utils/out vscode-extension-api.surge.sh
