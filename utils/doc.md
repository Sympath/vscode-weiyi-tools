## 前言

本文用于帮助用户在 vscode 插件 weiyi-tool 下自定义自己需要实现的逻辑，且插件提供了更友好的自定义开发支持， 创建时

1. 帮助创建模版
2. 提供在线文档；

使用时 支持上传云空间，多仓库公用，具体能力有：

- 自定义命令：weiyi-tool-custom-commands，用于定义用户所实现的命令逻辑，通过`weiyi-tool.customCommand`触发即会执行
- 自定义 snippet 目录名称：weiyi-tool-custom-snippets，用于自定义的智能提示，更灵活的 snippest，支持词汇级别和文件级别的提示。通过`weiyi-tool.smartTips`触发
- 自定义初始化文件目录名称：weiyi-tool-init-configs，用于生成一些文件或目录，当执行时会在指定路径上生成对应内容。通过`weiyi-tool.initConfig`触发

所有的 custom 命令都通过`weiyi-tool.upload-custom`生成以及上传。

## 具体信息

### API 文档

- vscodeApi：
- nodeApi：https://vscode-extension-api.surge.sh/global.html

### 图示

##### 实现定义

![image-20220918230600687](https://tva1.sinaimg.cn/large/e6c9d24ely1h6b5q728uaj21ms056dh2.jpg)

##### 触发

![image-20220918230423963](https://tva1.sinaimg.cn/large/e6c9d24ely1h6b5oir5gzj21lq05qwfr.jpg)

![image-20220918230354548](https://tva1.sinaimg.cn/large/e6c9d24ely1h6b5o0fr2gj21mo05odh8.jpg)

![image-20220918225924368](https://tva1.sinaimg.cn/large/e6c9d24ely1h6b5jjevovj21ni05ata4.jpg)

## 实战案例

我们以【自定义命令，触发时显示弹窗】为例

### 创建及触发动作如下

![2022-09-18 22.13.08](https://tva1.sinaimg.cn/large/e6c9d24ely1h6b5r3hv8bg215w0nt4qp.gif)

### 上传动作如下

![2022-09-18 22.15.06](https://tva1.sinaimg.cn/large/e6c9d24ely1h6b5rcuyw2g214z0nu7la.gif)
