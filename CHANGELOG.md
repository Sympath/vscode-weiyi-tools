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

- 右键启动静态服务 liveServer
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

## [Unreleased]

- 粘贴板
- 自动上传命令功能：将用户自定义的插件文件保存进插件目录中
- snippet 上传合并支持：当变量类型相同，用户上传时需要对 snippet 进行合并（同时也需要考虑 uploadedCallback 的清空）
- snippet 上传校验：当不符合条件时不执行上传动作
- snippet 上传所有：upload-all
- 一键搭建 shell 可视化 debug：引导用户安装插件、自动帮助更新 bash、生成配置文件
