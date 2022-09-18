## Functions

<dl>
<dt><a href="#fileIsExist">fileIsExist(filePath)</a> ⇒</dt>
<dd><p>判断文件是否存在</p>
</dd>
<dt><a href="#writeFileRecursive">writeFileRecursive(path, buffer)</a></dt>
<dd><p>写入文件</p>
</dd>
<dt><a href="#runCommand">runCommand(command, args)</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd></dd>
<dt><a href="#getFileExportObjInDir">getFileExportObjInDir(dirPath, suffix, opts：方法本身的配置对象)</a></dt>
<dd><p>获取指定目录下所有文件的导出信息</p>
</dd>
<dt><a href="#loadPathByName">loadPathByName(dirPath, names)</a></dt>
<dd><p>加载指定文件夹下指定后缀的文件路径列表 （不给exts参数时则获取所有类型文件）</p>
</dd>
<dt><a href="#loadFileNameByPath4Ext">loadFileNameByPath4Ext(dirPath, exts, cb)</a> ⇒</dt>
<dd><p>加载指定文件夹下指定后缀的文件路径列表 （不给exts参数时则获取所有类型文件）</p>
</dd>
<dt><a href="#doShellCmd">doShellCmd()</a> ⇒</dt>
<dd><p>对exec进行一个简单的封装，返回的是一个Promise对象，便于处理。</p>
</dd>
<dt><a href="#getPlatForm">getPlatForm()</a> ⇒</dt>
<dd><p>获取当前操作系统</p>
</dd>
<dt><a href="#getPackageManageByCommand">getPackageManageByCommand(command)</a></dt>
<dd><p>根据命令获取对应的包管理器</p>
</dd>
</dl>

<a name="fileIsExist"></a>

## fileIsExist(filePath) ⇒
判断文件是否存在

**Kind**: global function  
**Returns**: Boolean  

| Param | Type |
| --- | --- |
| filePath | <code>\*</code> | 

<a name="writeFileRecursive"></a>

## writeFileRecursive(path, buffer)
写入文件

**Kind**: global function  

| Param | Type |
| --- | --- |
| path | <code>\*</code> | 
| buffer | <code>\*</code> | 

<a name="runCommand"></a>

## runCommand(command, args) ⇒ <code>Promise.&lt;void&gt;</code>
**Kind**: global function  
**Returns**: <code>Promise.&lt;void&gt;</code> - promise  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>string</code> | process to run |
| args | <code>Array.&lt;string&gt;</code> | commandline arguments |

<a name="getFileExportObjInDir"></a>

## getFileExportObjInDir(dirPath, suffix, opts：方法本身的配置对象)
获取指定目录下所有文件的导出信息

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| dirPath | <code>\*</code> |  | 指定目录 需要绝对路径 |
| suffix | <code>\*</code> | <code>js</code> | 后缀 |
| opts：方法本身的配置对象 | <code>\*</code> |  | 1. removeRequireCache 是否清除require缓存，在【应用启动过程中会修改源码】的场景下执行          2. needAbsPath 是否挂载文件绝对路径信息再返回          3. globOpts glob的配置对象 |

<a name="loadPathByName"></a>

## loadPathByName(dirPath, names)
加载指定文件夹下指定后缀的文件路径列表 （不给exts参数时则获取所有类型文件）

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| dirPath | <code>\*</code> |  |
| names | <code>\*</code> | Array 文件名数组 [] |

<a name="loadFileNameByPath4Ext"></a>

## loadFileNameByPath4Ext(dirPath, exts, cb) ⇒
加载指定文件夹下指定后缀的文件路径列表 （不给exts参数时则获取所有类型文件）

**Kind**: global function  
**Returns**: [[filePath, dirs = []]] 返回一个二维数组 第一个元素是文件地址；第二个是对应的子目录数组  

| Param | Type | Description |
| --- | --- | --- |
| dirPath | <code>\*</code> |  |
| exts | <code>\*</code> | Array 文件类型数组 [mp4] |
| cb | <code>\*</code> | Function 可以在存入时对存入对象进行一层拦截处理 |

<a name="doShellCmd"></a>

## doShellCmd() ⇒
对exec进行一个简单的封装，返回的是一个Promise对象，便于处理。

**Kind**: global function  
**Returns**: Promise  
<a name="getPlatForm"></a>

## getPlatForm() ⇒
获取当前操作系统

**Kind**: global function  
**Returns**: obj  
<a name="getPackageManageByCommand"></a>

## getPackageManageByCommand(command)
根据命令获取对应的包管理器

**Kind**: global function  

| Param | Type |
| --- | --- |
| command | <code>\*</code> | 

