## 插件实现背景

微医工具集，目前实现功能如下

### 功能箱目录

选中目录工具箱

- 右键启动静态服务 doCommandInHere
- tree 输出转自动生成目录 formatProject
- 获取目录并生成 tree 结果 getProject

右键工具箱

- 发文格式自动化 formatArticle
- 生成保存自动格式化的配置文件 formatOnSave
- 下一行插入 log insertLog 【支持 js 和 shell】
- 横杠下划线转驼峰 toCamel
- 合并 package.json 依赖项 mergePackage

snippet

- 集成 shell 的 snippet：包含语句式 和 函数式
-

### 插件机制

为了让其他人方便的参与，暴露的自定义命令的机制，使用的同学可以自行实现自己的需求，然后按如下步骤实现接入 vscode。

1. 实现自己的需求，并按照 commonjs 规范导出一个函数（会在触发时执行）
2. 在项目根目录下新建 weiyi-tools-commands，将自己的实现放在此目录下
3. 使用时唤起命令面板（cmd+shift+p）执行 custom 命令，会弹出选择框，选中自己的命令即可触发定义的逻辑
   补充：关于 node 相关的 api 可以直接引入使用，vscode 相关的 api 绑定在了函数执行上下文的 this 中，函数执行时 this 代表 VscodeApi 对象（关于此对象提供的能力可见下文）

### 待完成功能

- 提供接入文档
- 用户自定义能力优化：目前存在问题如下
  - 当用户上传后保存的是 vscode 的空间，这时开发者发版就会删掉用户的上传
  - 自定义同名情况处理（同时也需要考虑 uploadedCallback 的清空）
  - 自定义时文档的提供（nodeApi 和 vscodeApi），需实现一个文档网站（可参考 jsdoc）
  - snippet 上传校验：当不符合条件时不执行上传动作
  - 支持用户上传实现的插件方法
  - 支持选择一个文件或者目录作为初始化内容
  - 支持指定相关扩展：弹窗显示扩展名+执行【@command:workbench.extensions.action.installExtensions】打开扩展安装区
- 思考如何支持接入者提 issue：如需要补充 vscodeApi 新的能力，目前可以通过 vscodeApi.vscode 实现，但还是尽可能封装一层
- 重构为 ts 项目
- 思考如何支持接入者提 issue
- 思考怎么让用户上传命令对应的安装方式，从而做到自动优化

## 功能详解

### 发文格式自动化 formatArticle

##### 面向问题

微医前端发文存在自己的固定格式，主要包含

- `([\u4e00-\u9fa5]+)([\da-zA-Z]+)`替换为`$1 $2`：中文和英文要有一个空格
- `([\da-zA-Z]+)([\u4e00-\u9fa5]+)`替换为`$1 $2`：中文和英文要有一个空格
- `!\[.+\]`替换为`![]`：处理图片描述
  这些动作每次需要人为处理，费时费力且易出错，固化流程尝试改用 vscode 插件自动实现，遂有 weiyi-tools 插件出现

##### 效果

![2022-05-08 23.28.59](https://tva1.sinaimg.cn/large/e6c9d24ely1h21uyzwezeg21940u078r.gif)

### 生成保存自动格式化的配置文件 formatOnSave

##### 面向问题

利用 vscode 配置文件 + prettier + eslint 实现保存自动格式化：https://juejin.cn/post/7103462793500131336/

##### 效果

![wecom-temp-4b07b297e13c92ac5d6bf4d2e096e2ff](https://tva1.sinaimg.cn/large/e6c9d24ely1h30n3norlcj20se09p3yy.jpg)

### 在选中目录下执行全局命令 doCommandInHere

##### 面向问题

我们使用 live-server 启动一个静态服务，但每次都要经历【开终端 - cd 到指定目录 - 执行 live-server】，终端还不能干掉

##### 效果

![2022-06-08 10.50.01](https://tva1.sinaimg.cn/large/e6c9d24ely1h30n9fbu3zg21et0lftlj.gif)

### 横杠转驼峰 toHump

##### 面向问题

在引入组件时，文件名是横杠格式的，而组件名是驼峰格式的，这个转换的动作十分重复

##### 效果

##### 面向问题

横杠转驼峰，我们在引入配置文件的时候

##### 效果

![wecom-temp-4b07b297e13c92ac5d6bf4d2e096e2ff](https://tva1.sinaimg.cn/large/e6c9d24ely1h30n3norlcj20se09p3yy.jpg)

##### 面向问题

实现 tree 输出转自动生成目录，复制 tree 命令输出内容，在需要生成的根目录下右键【formatProject】，会自动生成对应的目录结构；用于项目分享、文章分享时使用

##### 效果

![2022-06-20 11.17.21](https://tva1.sinaimg.cn/large/e6c9d24ely1h3ejhn9cfmg21bg0ligqi.gif)

## 使用执行

### 安装插件

在 vscode 侧边的扩展中搜索【weiyi-tools】安装。

### 执行插件

在命令面板执行对应命令即可。唤起命令面板快捷键如下

- mac：cmd + shift + p
- win：ctrl + shift + p

### 使用效果

## 未启动的命令

```
// { 插入log日志
        "command": "weiyi-tools.insertLog",
        "title": "insertLog"
      //   "command": "weiyi-tools.helloWorld",
      //   "title": "Hello weiyi-tools"
      // },
      // { 选中的字符反转
      //   "command": "weiyi-tools.reserve",
      //   "title": "Hello reserve"
      // },
      // { 选中的代码块上下插入console.time
      //   "command": "weiyi-tools.insertTime",
      //   "title": "insertTime"
      // },
      // { 删除当前文档中所有的log
      //   "command": "weiyi-tools.delLog",
      //   "title": "delLog"
      // },
```

# 注释的快捷键

```
{
        "key": "ctrl+h",
        "command": "weiyi-tools.helloWorld"
      },
      {
        "key": "ctrl+shift+r",
        "command": "weiyi-tools.reserve"
      },
      {
        "key": "ctrl+shift+t",
        "command": "weiyi-tools.insertTime"
      }
```

## TODO

1. git 批量上传：一个目录下有多个相关的 git 仓库，输入一个 message 就可以批量上传 checked（gitUpload）
2. git 共用仓库管理（暂定仓库目录为 github-manage）
   1. 拆分下拉：一个仓库选择对应分支，就下载对应分支的内容；比如 util 中存在 cjs 和 es6，选择后会自动下载对应分支；上传时也会只更新那部分内容
   2. sh 脚本仓库选择框执行
3. renamePic：批量重命名
4. iframe 嵌入使用各个页面，参考https://github.com/wangshoukai/YuQueForVSCode/blob/main/src/extension.ts
5. 图片提取文字
6. 文件同步：更改 指定 仓库后一键同步对应所有的下拉仓库（如 utils；解决新增方法后需要手动同步问题）
7. 同步 shell 脚本仓库，支持
   1. 下拉选择框执行对应脚本
   2. 更新仓库
8. 支持 kano 微图上传
9. 嵌入 iframe：使用测吧
10. 支持 js 文件邮件直接生成文档并打开浏览器预览 jsdoc + live-server
11. 在自定义逻辑上传成功后提示用户删除本地文件，支持询问帮助删除
