## 插件实现背景
微医工具集，目前实现功能如下
### 功能箱目录
- 发文格式自动化 formatArticle
- 生成保存自动格式化的配置文件 formatOnSave
- 右键启动静态服务 liveServer
- tree输出转自动生成目录 formatProject

### 待完成功能
- 粘贴板

## 功能详解
### 发文格式自动化 formatArticle
##### 面向问题
微医前端发文存在自己的固定格式，主要包含
- `([\u4e00-\u9fa5]+)([\da-zA-Z]+)`替换为`$1 $2`：中文和英文要有一个空格
- `([\da-zA-Z]+)([\u4e00-\u9fa5]+)`替换为`$1 $2`：中文和英文要有一个空格
- `!\[.+\]`替换为`![]`：处理图片描述
这些动作每次需要人为处理，费时费力且易出错，固化流程尝试改用vscode插件自动实现，遂有edit-article插件出现
##### 效果
![2022-05-08 23.28.59](https://tva1.sinaimg.cn/large/e6c9d24ely1h21uyzwezeg21940u078r.gif)
### 生成保存自动格式化的配置文件 formatOnSave
##### 面向问题
利用vscode配置文件 + prettier + eslint实现保存自动格式化：https://juejin.cn/post/7103462793500131336/
##### 效果
![wecom-temp-4b07b297e13c92ac5d6bf4d2e096e2ff](https://tva1.sinaimg.cn/large/e6c9d24ely1h30n3norlcj20se09p3yy.jpg)
### 右键启动静态服务 liveServer
##### 面向问题
我们使用live-server启动一个静态服务，但每次都要经历【开终端 - cd到指定目录 - 执行live-server】，终端还不能干掉
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
实现tree输出转自动生成目录，在具有tree命令输出内容的markdown中右键点击，执行后会自动生成对应的目录结构；用于项目分享、文章分享时使用
##### 效果
![2022-06-19 15.19.36](https://tva1.sinaimg.cn/large/e6c9d24ely1h3dkvf1pfeg22080u00wz.gif)


## 使用执行
### 安装插件

在vscode侧边的扩展中搜索【edit-article】安装。

### 执行插件

在命令面板执行对应命令即可。唤起命令面板快捷键如下

- mac：cmd + shift + p
- win：ctrl + shift + p

### 使用效果



## 未启动的命令
```
// { 插入log日志
        "command": "edit-article.insertLog",
        "title": "insertLog"
      //   "command": "edit-article.helloWorld",
      //   "title": "Hello edit-article"
      // },
      // { 选中的字符反转
      //   "command": "edit-article.reserve",
      //   "title": "Hello reserve"
      // },
      // { 选中的代码块上下插入console.time
      //   "command": "edit-article.insertTime",
      //   "title": "insertTime"
      // },
      // { 删除当前文档中所有的log
      //   "command": "edit-article.delLog",
      //   "title": "delLog"
      // },
```
# 注释的快捷键
```
{
        "key": "ctrl+h",
        "command": "edit-article.helloWorld"
      },
      {
        "key": "ctrl+shift+r",
        "command": "edit-article.reserve"
      },
      {
        "key": "ctrl+shift+t",
        "command": "edit-article.insertTime"
      }
```