#!/bin/zsh
node -v
echo "$1"

# if [  ]; then
#     # if body
# fi
# if [[ "${1}" == "${}" ]]; then
#     echo "The two strings are the same"
# fi
# # 更新下在线文档信息
jsdoc utils/node-api.js
jsdoc utils/vscode-api.js
# # 发布最新的文档信息 访问http://vscode-extension-api.surge.sh/global.html#fileIsExist即可查看
surge teardown vscode-extension-api.surge.sh
surge utils/out vscode-extension-api.surge.sh
git add .
git commit -m "$1"
vsce publish patch
