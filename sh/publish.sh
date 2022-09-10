# 解决相对路径问题 执行脚本前先进入脚本所在的目录
cd $(dirname $0)
source $HOME/.nvm/nvm.sh
nvm use v14
echo $(node -v)
vsce publish patch
# 执行完成后切换会上一次目录 相当于 `cd OLDPWD`
cd -
