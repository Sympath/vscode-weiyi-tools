# Change Log

All notable changes to the "weiyi-tools" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## 0.x 版本：命令合集，glob 批量引入

- 实现文章格式化能力：支持微医的前端一键发文
- 生成保存自动格式化的配置文件：利用 vscode 配置文件 + prettier + eslint 实现保存自动格式化
- 实现右键启动静态服务：我们使用 live-server 启动一个静态服务，但每次都要经历【开终端 - cd 到指定目录 - 执行 live-server】，终端还不能干掉
- 横杠转驼峰：横杠转驼峰，我们在引入配置文件的时候
- 项目目录自动生成：实现 tree 输出转自动生成目录，复制 tree 命令输出内容，在需要生成的根目录下右键【formatProject】，会自动生成对应的目录结构；用于项目分享、文章分享时使用
- 插入 log 日志：选中变量，下方出现变量打印语句，支持 js 和 shell

## 1.x 版本：模块化，功能箱

### 选中目录工具箱

- 在选中目录下执行全局命令 doCommandInHere
- tree 输出转自动生成目录 formatProject
- 获取目录并生成 tree 结果 getProject

### 右键工具箱

- 发文格式自动化 formatArticle
- 生成保存自动格式化的配置文件 formatOnSave
- 下一行插入 log insertLog 【支持 js 和 shell】
- 横杠下划线转驼峰 toCamel
- 合并 package.json 依赖项 mergePackage

## 2.x 版本：shell 支持

- 集成 shell 的 snippet：包含语句式 和 函数式
- 完成 shell 的函数库，以变量类型区分；常用语句使用 snippet，变量属性和方法使用函数库
- 完成 shell 智能提示：xxx.格式自动显示函数库内的函数

## 3.x 用户自定义逻辑

更强的自定义能力，目前自定义支持如下，只需要按照对应目录名在仓库根目录下创建，然后实现自己的逻辑即可接入插件，实现【一处实现，多处使用】

- 自定义命令：weiyi-tools-custom-commands
- 自定义 snippet 目录名称：weiyi-tools-custom-snippets
- 自定义初始化文件目录名称：weiyi-tools-init-configs
- 持久化支持：upload-custom，用户在自己的项目根目录下实现对应格式的内容，然后触发此命令，即可完成持久化
- 统一上传命令 支持引导用户创建模板
  对应定义方式文档待补充
- 支持内部中间件逻辑：对应目录 upload-custom-middle，可参考上传所有，upload-all
- 支持右键执行全局命令

## TODO

- 文档网站待实现：VscodeApi 对象能力、nodeApi 能力、用户自定义逻辑规范
- 自动上传命令功能：将用户自定义的插件文件保存进插件目录中
- 用户自定义上传能力支持
- 粘贴板
- snippet 上传合并支持：当变量类型相同，用户上传时需要对 snippet 进行合并（同时也需要考虑 uploadedCallback 的清空）
- snippet 上传校验：当不符合条件时不执行上传动作
- 一键搭建 shell 可视化 debug：引导用户安装插件、自动帮助更新 bash、生成配置文件
- 整理 commandIns 目录
