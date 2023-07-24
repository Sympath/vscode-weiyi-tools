# AutoTryNsssode

1. xmlHandler 支持设定锚节点 自动生成目标节点的访问路径
2. 脚本文件夹及meta.json根据输入信息自动创建
3. 脚本文件根据模版文件移动 并自动生成脚本运行命令 生成至剪切板
4. 脚本文件中的变量部分提取 实现节点访问算法 - 支持根据特定id text classname 及三个属性联合确定一个节点，并生成访问对象对模版文件进行替换
5. 脚本文件中的变量部分提取 实现节点访问算法 - 优化算法，支持兄弟节点的匹配处理，生成offset属性
6. 脚本文件中的变量部分提取 实现节点访问算法 - 优化算法，借鉴xmlHandler 支持设定锚节点，自动生成对应访问路径并替换函数
7. 脚本文件中的变量部分提取 实现节点访问算法 - 优化算法，无需设定锚节点，根据目标节点的祖先节点及其兄弟节点找到确定节点然后自动生成并替换

遇到的问题
1. 兄弟节点确定最短路径问题：如果从上到下或从下到上执行会导致偏移量过大，所以采用步骤变更法，step变量记录相对指定索引的偏移量从而做到左右左右遍历


用户体验优化：
1. 用户写属性名和属性值记不住：实现第二个辅助命令用于生成内容并插入光标所在位置
# 前言
### 获取一个节点的方式
1. 页面xml结构看是否有id，有则使用属性名 resourceId ，属性值为id值（注意⚠️，如果id值上面有数值不要使用id，大概率会变动）
2. 页面xml结构看关键文本是否唯一，唯一则使用属性名 text ，属性值为文本
3. 页面xml结构看相邻节点是否有唯一节点，使用上述方式获取到相邻节点然后使用属性名offset进行偏移，属性值为偏移位
4. 如果是输入框，可以自己输入一些字符，再抓取一边xml，然后搜索看id
5. ⚠️如果没有特殊标识，可以找到相近的具体特殊标识的节点，然后使用如下api实现
   1. getParent：获取父节点
   2. getChild：获取子节点，可以传入index，从0开始

#### 获取节点
##### 辅助方法
属性值是否唯一：在字符串中查找是否存在指定字符串，区分大小写
##### 生成唯一确定节点的获取对象 formatConfirmOnlyNodeParam
1. 如果属性存在id且id不包含数字 取 exactResourceId
2. 如果属性存在Text（如果是codeInput则忽略此步）
   1. Text唯一 取 exactText
   2. Text不唯一 判断相同Text节点的ClassName是否唯一
      1. 唯一 取联合属性对象exactText + exactClassName
      2. 不唯一 
3. 看父节点的子节点数组中是否存在唯一确定节点 然后通过offset确定

##### 此外情况 锚节点反推法
看祖先节点是否存在唯一确定节点（formatConfirmOnlyNodeParam），然后通过xmlHandler找到，这步需要重写getXXX函数


# 具体实现
## 脚本处理1 checkoutUrl
1. 无随机数
2. 有随机数

## 脚本处理2 codeEntry
formatConfirmOnlyNodeParam(32)
## 脚本处理2 codeInput
formatConfirmOnlyNodeParam(isCodeInput)
## 脚本处理3 applyButton
formatConfirmOnlyNodeParam()
## 脚本处理4 price
formatConfirmOnlyNodeParam()
# 注意 removeButton 即删除优惠券节点 只能匹配成功优惠券后获取 得手动写了

