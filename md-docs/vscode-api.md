<a name="VscodeApi"></a>

## VscodeApi
A fancier event target that does cool things.

**Kind**: global class  
**Implements**: <code>Iterable&lt;string&gt;</code>  

* [VscodeApi](#VscodeApi)
    * [.$toast(content)](#VscodeApi+$toast)
    * [.log()](#VscodeApi+log)
    * [.clipboardWriteText(val)](#VscodeApi+clipboardWriteText)
    * [.getAbsPathByRelativeRoot(fileName)](#VscodeApi+getAbsPathByRelativeRoot)
    * [.replaceText(oldText, newText, replaceAll)](#VscodeApi+replaceText)
    * [.deleteByRange(range)](#VscodeApi+deleteByRange)
    * [.deleteByText(text, line)](#VscodeApi+deleteByText)
    * [.replaceDocument(matchMaps)](#VscodeApi+replaceDocument)
    * [.replaceSelectText(newVal)](#VscodeApi+replaceSelectText)
    * [.insertText(val, line, startCharacter)](#VscodeApi+insertText)
    * [.insertTextToNextLine(val)](#VscodeApi+insertTextToNextLine)
    * [.runGlobalCommand(npmPackageCommand)](#VscodeApi+runGlobalCommand)
    * [.runVscodeCommand(npmPackageCommand)](#VscodeApi+runVscodeCommand)
    * [.installPackageGlobal(npmPackage, continueExec)](#VscodeApi+installPackageGlobal)
    * [.emit()](#VscodeApi+emit)

<a name="VscodeApi+$toast"></a>

### vscodeApi.$toast(content)
**Kind**: instance method of [<code>VscodeApi</code>](#VscodeApi)  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>\*</code> | 提示内容 支持字符串和不传，字符串则直接以默认弹出框显示 |

<a name="VscodeApi+log"></a>

### vscodeApi.log()
用于打印输出信息到vscode的输出控制台
输出的内容

**Kind**: instance method of [<code>VscodeApi</code>](#VscodeApi)  
<a name="VscodeApi+clipboardWriteText"></a>

### vscodeApi.clipboardWriteText(val)
写入内容到剪切板中

**Kind**: instance method of [<code>VscodeApi</code>](#VscodeApi)  

| Param | Type |
| --- | --- |
| val | <code>\*</code> | 

<a name="VscodeApi+getAbsPathByRelativeRoot"></a>

### vscodeApi.getAbsPathByRelativeRoot(fileName)
以文件相对项目根目录的相对路径，获取指定文件或文件夹的绝对路径

**Kind**: instance method of [<code>VscodeApi</code>](#VscodeApi)  

| Param | Type | Description |
| --- | --- | --- |
| fileName | <code>\*</code> | {  has: 所有打开的工作区指定目录下是否有指定文件  paths: 所有打开的工作区指定目录指定文件的绝对路径  onlyPath: 如果只有一个工作区有指定文件，则将绝对路径赋值在这个属性上 } |

<a name="VscodeApi+replaceText"></a>

### vscodeApi.replaceText(oldText, newText, replaceAll)
替换内容，需要emit触发

**Kind**: instance method of [<code>VscodeApi</code>](#VscodeApi)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| oldText | <code>\*</code> |  |  |
| newText | <code>\*</code> |  |  |
| replaceAll | <code>\*</code> | <code>true</code> | 全文替换模式 默认trueeditBehaviorHandler |

<a name="VscodeApi+deleteByRange"></a>

### vscodeApi.deleteByRange(range)
删除指定范围的内容

**Kind**: instance method of [<code>VscodeApi</code>](#VscodeApi)  

| Param | Type |
| --- | --- |
| range | <code>\*</code> | 

<a name="VscodeApi+deleteByText"></a>

### vscodeApi.deleteByText(text, line)
删除指定内容

**Kind**: instance method of [<code>VscodeApi</code>](#VscodeApi)  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>\*</code> | 指定内容 |
| line | <code>\*</code> | 指定内容所在行 |

<a name="VscodeApi+replaceDocument"></a>

### vscodeApi.replaceDocument(matchMaps)
多匹配规则的全文替换 需要emit触发

**Kind**: instance method of [<code>VscodeApi</code>](#VscodeApi)  

| Param | Type |
| --- | --- |
| matchMaps | <code>\*</code> | 

<a name="VscodeApi+replaceSelectText"></a>

### vscodeApi.replaceSelectText(newVal)
替换当前选中的内容 需要emit触发

**Kind**: instance method of [<code>VscodeApi</code>](#VscodeApi)  

| Param | Type | Description |
| --- | --- | --- |
| newVal | <code>\*</code> | 新的内容 |

<a name="VscodeApi+insertText"></a>

### vscodeApi.insertText(val, line, startCharacter)
插入内容，默认插入到首行首列 需要emit触发

**Kind**: instance method of [<code>VscodeApi</code>](#VscodeApi)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| val | <code>\*</code> |  |  |
| line | <code>\*</code> | <code>0</code> | 行 |
| startCharacter | <code>\*</code> | <code>0</code> | 列 |

<a name="VscodeApi+insertTextToNextLine"></a>

### vscodeApi.insertTextToNextLine(val)
插入内容至当前选中行的下一行 需要emit触发

**Kind**: instance method of [<code>VscodeApi</code>](#VscodeApi)  

| Param | Type |
| --- | --- |
| val | <code>\*</code> | 

<a name="VscodeApi+runGlobalCommand"></a>

### vscodeApi.runGlobalCommand(npmPackageCommand)
执行全局npm包的命令，没有依赖的时候提醒安装

**Kind**: instance method of [<code>VscodeApi</code>](#VscodeApi)  

| Param | Type | Description |
| --- | --- | --- |
| npmPackageCommand | <code>\*</code> | 命令 |

<a name="VscodeApi+runVscodeCommand"></a>

### vscodeApi.runVscodeCommand(npmPackageCommand)
执行vscode命令

**Kind**: instance method of [<code>VscodeApi</code>](#VscodeApi)  

| Param | Type | Description |
| --- | --- | --- |
| npmPackageCommand | <code>\*</code> | 命令 |

<a name="VscodeApi+installPackageGlobal"></a>

### vscodeApi.installPackageGlobal(npmPackage, continueExec)
安装全局命令

**Kind**: instance method of [<code>VscodeApi</code>](#VscodeApi)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| npmPackage | <code>\*</code> |  |  |
| continueExec | <code>\*</code> | <code>false</code> | 是否自动继续执行命令 |

<a name="VscodeApi+emit"></a>

### vscodeApi.emit()
触发需要修改当前document的api

**Kind**: instance method of [<code>VscodeApi</code>](#VscodeApi)  
