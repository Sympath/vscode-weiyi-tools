## 插件实现背景

微医工具集，目前实现功能如下

### 功能箱目录

选中目录工具箱

- 右键启动静态服务 liveServer
- tree 输出转自动生成目录 formatProject
- 获取目录并生成 tree 结果 getProject

右键工具箱

- 发文格式自动化 formatArticle
- 生成保存自动格式化的配置文件 formatOnSave
- 下一行插入 log insertLog
- 横杠下划线转驼峰 toCamel
- 合并 package.json 依赖项 mergePackage

### 插件机制

为了让其他人方便的参与，暴露的自定义命令的机制，使用的同学可以自行实现自己的需求，然后按如下步骤实现接入 vscode。

1. 实现自己的需求，并按照 commonjs 规范导出一个函数（会在触发时执行）
2. 在项目根目录下新建 weiyi-tools，将自己的实现放在此目录下
3. 使用时唤起命令面板（cmd+shift+p）执行 custom 命令，会弹出选择框，选中自己的命令即可触发定义的逻辑
   补充：关于 node 相关的 api 可以直接引入使用，vscode 相关的 api 绑定在了函数执行上下文的 this 中，函数执行时 this 代表 VscodeApi 对象（关于此对象提供的能力可见下文）

### 待完成功能

- 粘贴板
- 自动上传命令功能：将用户自定义的插件文件保存进插件目录中

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

### 右键启动静态服务 liveServer

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

1. git 批量上传：一个目录下有多个相关的 git 仓库，输入一个 message 就可以批量上传
2. git 拆分下拉：一个仓库选择对应分支，就下载对应分支的内容；比如 util 中存在 cjs 和 es6，选择后会自动下载对应分支；上传时也会只更新那部分内容
3. renamePic：批量重命名
4. iframe 嵌入使用各个页面，参考https://github.com/wangshoukai/YuQueForVSCode/blob/main/src/extension.ts
5. 图片提取文字
