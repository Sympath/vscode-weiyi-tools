#!/bin/zsh
node -v
echo "$1"
# 如果没有输入commit信息就中止发布
if [[ -z "${1}" ]]; then
    echo "请输入本次修改commit信息"
    exit 1
fi
# # 更新下vscode-api 和 node-api的在线文档信息
jsdoc utils -R utils/doc.md
# # 发布最新的文档信息 访问http://vscode-extension-api.surge.sh/global.html#fileIsExist即可查看
surge teardown vscode-extension-api.surge.sh
surge out vscode-extension-api.surge.sh
# 进行git仓库的上传
git add .
git commit -m "$1"
git push
# 更新vscode插件
vsce publish patch
