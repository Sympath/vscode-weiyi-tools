let name = "geneAutoTry";
const fs = require("fs");
const path = require("path");
const { promisify } = require('util');
const VscodeApi = require("../utils/vscode-api");
const nodeApi = require("../utils/node-api");
const xml2js = require("xml2js");
const { eachObj } = require("../utils");
let vscodeApi = new VscodeApi(name);
let templateStr = '' // ts模版字符串内容
let xmlStr = '' // xml字符串内容
let xmlPath = '' // xml路径
let commonTemplateTs = path.join(__dirname, './auto-try/template.ts')
let replaceHolderTemplateTs = path.join(__dirname, './auto-try/replaceHolder-template.ts')
let checkoutUrl = '';

/** 字符串首字母转大写
 * 
 * @param {*} str 
 * @returns 
 */
function capitalizeFirstLetter(str) {
  // 将首字母转换为大写，再拼接剩余部分
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// 目标属性处理对象
const targetNodeMap = {
  codeEntry: {
    node: null, // 源节点
    Text: null, // Text内容
    ID: null, // ID
    siblingNodes: [], // 兄弟节点数组
    equalTexts: [],// 相同Text的节点数组
    equalClassNames: [], // 相同类名的节点数组
    defaultFnCode: ''
  },
  codeInput: {
    node: null, // 源节点
    Text: null, // Text内容
    ID: null, // ID
    siblingNodes: [], // 兄弟节点数组
    equalTexts: [],// 相同Text的节点数组
    equalClassNames: [], // 相同类名的节点数组
    defaultFnCode: ''
  },
  applyButton: {
    node: null, // 源节点
    Text: null, // Text内容
    ID: null, // ID
    siblingNodes: [], // 兄弟节点数组
    equalTexts: [],// 相同Text的节点数组
    equalClassNames: [], // 相同类名的节点数组
    defaultFnCode: ''
  },
  price: {
    node: null, // 源节点
    Text: null, // Text内容
    ID: null, // ID
    siblingNodes: [], // 兄弟节点数组
    equalTexts: [],// 相同Text的节点数组
    equalClassNames: [], // 相同类名的节点数组
    defaultFnCode: ''
  },
}
// 处理一些默认值
eachObj(targetNodeMap, (key, val) => {
  let defaultFnCode = `const get${capitalizeFirstLetter(key)} = async () => {
    return await findNodeAsync(params.${key}!)
  };`;
  if (key === 'price') {
    defaultFnCode = `const getPrice = async () => {
    const child = await findNodeAsync(params.price);
    info(\`current price before ====\${ child?.getText() || '' } \`)
    const regex = /[^\\d£$.,€]+/g;
    const amount = (child?.getText() || "").replace(regex, "");
    info(\`current price ====\${ amount } \`);
    const price = getPriceFromText(amount);
    info(\`current price handled ====\${ price.value } \`);
    // return await findNodeAsync(params.price);
  };`
  }
  val.defaultFnCode = defaultFnCode
  let defaultParams = `${key}: {
      exactText: '${key}填充文案 不写属性会堵塞运行',
    },`
  val.defaultParams = defaultParams
})
// 读取指定路径文件并返回文件内容字符串
function readFileContent(filePath) {
  // 将 fs.readFile 方法转换成 Promise 形式
  const readFilePromise = promisify(fs.readFile);
  return readFilePromise(filePath, 'utf8');
}
/** 判断指定路径文件是否存在
 * 
 * @param {*} filePath 
 * @returns 
 */
function checkFileExistsAsync(filePath) {
  const access = promisify(fs.access);
  return access(filePath, fs.constants.F_OK)
    .then(() => true) // 文件存在
    .catch(() => false); // 文件不存在
}
function removeSpecialCharactersAndLowerCase(input) {
  // 去除特殊字符和空格
  const cleanedString = input.replace(/[^\w\s]/g, '').replace(/\s+/g, '');
  // 将字符串转换为全小写
  const lowerCaseString = cleanedString.toLowerCase();
  return lowerCaseString
}
/** 从指定索引处遍历数组 不处理索引本身
 * 
 * @param {*} arr 
 * @param {*} startIndex 
 * @param {*} confirmFn 
 * @returns 返回符合条件params对象
 */
function traverseArrayInPattern(arr, startIndex, confirmFn) {
  let anchTargetParams = null;
  let offset = null
  let leftIndex = startIndex - 1;
  let rightIndex = startIndex + 1;
  let step = 1;
  let count = 0;

  while (count < arr.length - 1) {
    if (leftIndex >= 0 && !anchTargetParams) {
      anchTargetParams = confirmFn(arr[leftIndex]);
      count++;
      offset = startIndex - leftIndex
    }
    if (rightIndex < arr.length && !anchTargetParams) {
      anchTargetParams = confirmFn(arr[rightIndex]);
      count++;
      offset = startIndex - rightIndex
    }
    if (anchTargetParams) {
      return {
        ...anchTargetParams,
        offset
      }
    }

    leftIndex = startIndex - step;
    rightIndex = startIndex + step + 1;
    step++;
  }

}

/** 获取字符串中指定字符加上单引号或者双引号的次数
 * 
 * @param {*} inputString  模版字符串
 * @param {*} searchString 目标字符串
 * @returns 
 */
function countOccurrencesWithQuotes(inputString, searchString) {
  const regex = new RegExp(`['"]${searchString}['"]`, 'g');
  const occurrences = (inputString.match(regex) || []).length;
  return occurrences;
}
/** 获取字符串中存在指定字符串的次数
 * 
 * @param {*} inputString  模版字符串
 * @param {*} searchString 目标字符串
 * @returns 
 */
function countOccurrences(inputString, searchString) {
  const occurrences = inputString.split(searchString).length - 1;
  return occurrences;
}

/** 删除指定索引数组
 * 
 * @param {*} arr 
 * @param {*} indexToRemove 
 * @returns 
 */
function removeElementAtIndex(arr, indexToRemove) {
  if (indexToRemove < 0 || indexToRemove >= arr.length) {
    // 索引超出范围，直接返回原数组
    return arr;
  }

  // 使用 slice() 方法创建新数组，去除指定索引的元素
  const newArr = arr.slice(0, indexToRemove).concat(arr.slice(indexToRemove + 1));

  return newArr;
}
/** 判断字符串中是否有数字
 * 
 * @param {*} inputString 
 * @returns 
 */
function hasDigit(inputString) {
  const digitRegex = /\d/;
  return digitRegex.test(inputString);
}

// function isSubstringAppearingOnce(mainString, subString) {
//   const occurrences = mainString.split(subString).length - 1;
//   return occurrences === 1;
// }
/** 根据目标节点生成查找参数
 * 
 * @param {*} handlerNode 
 * @param {*} isCodeInputOrPrice 
 * @returns 
 */
function formatConfirmOnlyNodeParam(handlerNode, nodeType) {
  let isCodeInputOrPrice = nodeType === 'codeInput' || nodeType === 'price'
  let { siblingNodes, childIndex, anchNode } = handlerNode
  let result = {
    fnCode: targetNodeMap[nodeType].defaultFnCode,
    targetParams: null
  }
  // 1. 如果属性存在ID
  //    1. ID不包含数字 取 exactResourceId
  //    2. 包含数字 取【ID不包含数字】部分生成正则，判断符合此类正则节点的ClassName是否唯一（涉及正则，先不考虑）
  // 2. 如果属性存在 ClassName
  // 1. ClassName唯一 取 exactClassName
  // 3. 如果属性存在Text（如果是codeInput则忽略此步）
  //   1. Text唯一 取 exactText
  //   2. Text不唯一 判断相同Text节点的ClassName是否唯一
  //       1. 唯一 取联合属性对象 exactText + exactClassName
  //       2. 不唯一
  // 4. 看父节点的子节点数组中是否存在唯一确定节点 然后通过offset确定
  function getFnByAnchNode(anchorNode, targetNode) {
    function isMatch(obj1, obj2) {
      for (var key in obj2) {
        if (obj1[key] !== obj2[key]) {
          return false;
        }
      }
      return true;
    }
    let anchParents = anchorNode.parents;
    let targetParents = targetNode.parents;
    let commonParent = null;
    let continueFind = true;

    // 通过两个祖先长度决定从谁开始索引 短的作为开始，长的作为被索引数组
    // let begin = anchParents.length > targetParents.length ? "target" : "anch";
    // let beginParents = [];
    // let endParents = [];
    let anchStep = -1;
    let targetStep = -1;
    let targetChildIndexArr = [];
    // 此处处理特殊情况 ==== 如果锚节点就是子节点的祖先节点
    for (let index = targetParents.length - 1; index >= 0; index--) {
      const targetParent = targetParents[index];
      const { parents, AnchNodeType, children, ...anchNodeWithoutParent } = anchorNode;
      if (continueFind) {
        if (isMatch(targetParent, anchNodeWithoutParent)) {
          commonParent = anchNodeWithoutParent;
          continueFind = false;
          // if (begin === "anch") {
          anchStep = 0;
          targetStep = targetParents.length - 1 - index + 1;
          targetChildIndexArr = targetParents
            .slice(index + 1)
            .map((a) => a.childIndex);
        }
      } else {
        break;
      }
    }
    if (anchParents && targetParents) {
      // if (begin === "target") {
      //   beginParents = targetParents;
      //   endParents = anchParents;
      // } else {
      //   beginParents = anchParents;
      //   endParents = targetParents;
      // }
      // 递归json节点，为每个节点添加如下属性
      // 1. parents ：祖先节点数组
      // 2. childIndex ：当前节点在父节点的子节点数组中的索引
      // 找到两个节点的祖先节点数组，倒叙查询比较找到最小父节点
      // 通过公共父节点在两个节点祖先节点数组索引确定两个节点分别到公共父节点的长度，从而确定要生成多少个 getParent 和getChildren
      // 此时我们已经可以确定getParent的数量
      // 公共父节点到targetNode还需要确定每个节点所在的索引，我们可以依赖childIndex
      for (let i = anchParents.length - 1; i >= 0; i--) {
        if (continueFind) {
          for (let index = targetParents.length - 1; index >= 0; index--) {
            const parent = targetParents[index];
            if (continueFind) {
              if (isMatch(parent, anchParents[i])) {
                commonParent = anchParents[i];
                continueFind = false;
                // if (begin === "anch") {
                anchStep = anchParents.length - 1 - i + 1;
                targetStep = targetParents.length - 1 - index + 1;
                targetChildIndexArr = targetParents
                  .slice(index + 1)
                  .map((a) => a.childIndex);
                // } else {
                //   anchStep = anchParents.length - index - 1;
                //   targetStep = targetParents.length - i - 1;
                // }
              }
            } else {
              break;
            }
          }
        } else {
          break;
        }
      }
    }
    targetChildIndexArr.push(handlerNode.childIndex);
    let getParentStr = "";
    let getChildrenStr = "";
    for (let index = 0; index < anchStep; index++) {
      getParentStr += ".getParent()";
    }
    for (let index = 0; index < targetChildIndexArr.length; index++) {
      const childIndex = targetChildIndexArr[index];
      getChildrenStr += `.getChild(${childIndex})`;
    }

    let paramsObjMatch = {
      Text: 'exactText',
      ID: 'exactResourceId',
      ClassName: 'exactClassName',
    };
    let params = {};
    eachObj(anchorNode, (key, val) => {
      if (paramsObjMatch[key]) {
        // 如果属性值为空就不添加在匹配条件中
        if (val) {
          params[paramsObjMatch[key]] = val;
        }
      } else {
        vscodeApi.$log(`${key}不存在对应处理属性`);
      }
    });

    let targetOutput = `const get${capitalizeFirstLetter(nodeType)} = async () => {
      const anchNode = await findNodeAsync(params.${nodeType});
      return anchNode${getParentStr}${getChildrenStr}
};`
    vscodeApi.$log(targetOutput)
    return { fnCode: targetOutput, params }
  }
  function innerConfirmOnlyNodeParams(innerHandlerNode) {
    let { ID, Text, ClassName, equalTexts, equalClassNames } = innerHandlerNode
    let targetParams = null
    if (ID && !hasDigit(ID)) {
      targetParams = {
        exactResourceId: ID
      }
    } else {
      if (isCodeInputOrPrice) {
        if (ClassName) {
          if (equalClassNames.length === 0) {
            targetParams = {
              exactClassName: ClassName
            }
          }
        }
      } else {
        if (Text && !hasDigit(Text)) {
          if (equalTexts.length === 0) {
            targetParams = {
              exactText: Text
            }
          } else {
            if (ClassName && equalClassNames.length === 0) {
              targetParams = {
                exactText: Text,
                exactClassName: ClassName
              }
            }
          }
        } else if (ClassName) {
          if (equalClassNames.length === 0) {
            targetParams = {
              exactClassName: ClassName
            }
          }
        }
      }
    }
    return targetParams
  }
  /** 判断兄弟节点是否是确定唯一节点
   * 
   * @param {*} siblingNode 
   * @returns 
   */
  function siblingNodeConfirmOnlyNodeParams(siblingNode) {
    let { ID, Text, ClassName } = siblingNode
    let targetParams = null
    if (ID && !hasDigit(ID)) {
      targetParams = {
        exactResourceId: ID
      }
    } else {
      if (Text && !hasDigit(Text)) {
        if (countOccurrencesWithQuotes(xmlStr, Text) === 1) {
          targetParams = {
            exactText: Text
          }
        } else {
          if (ClassName && countOccurrencesWithQuotes(xmlStr, ClassName) === 1) {
            targetParams = {
              exactText: Text,
              exactClassName: ClassName
            }
          }
        }
      } else if (ClassName) {
        if (countOccurrencesWithQuotes(xmlStr, Text) === 1) {
          targetParams = {
            exactClassName: ClassName
          }
        }
      }

    }
    return targetParams
  }
  /** 根据目标节点的祖先节点及其兄弟节点找到确定节点
   * 
   * @param {*} node 
   */
  function getOnlyNodeByParent(node, handlerNode) {
    let parents = node.parents

    let result = {
      fnCode: '',
      targetParams: null
    }
    function genFnCode(parents, parentNodeIndexInParents) {
      // let parentNodeIndexInParents = parents.indexOf(parentNode)
      let targetChildIndexArr = [];
      let getChildrenStr = ""
      targetChildIndexArr = parents
        // 已经根据offset处理了本身 所以再次+1
        .slice(parentNodeIndexInParents + 1 + 1)
        .map((a) => a.childIndex);
      targetChildIndexArr.push(handlerNode.childIndex);
      for (let index = 0; index < targetChildIndexArr.length; index++) {
        const childIndex = targetChildIndexArr[index];
        getChildrenStr += `.getChild(${childIndex})`;
      }
      let targetOutput = `const get${capitalizeFirstLetter(node.AutoTryNode)} = async () => {
      const anchNode = await findNodeAsync(params.${node.AutoTryNode});
      return anchNode${getChildrenStr}
};`
      return targetOutput
    }
    // let offset = null;
    for (let index = parents.length - 1; index >= 0; index--) {
      const p = parents[index];
      const siblingNodes = p.children;
      function getCommonElements(arr1, arr2) {
        for (let index = 0; index < arr1.length; index++) {
          const a1 = arr1[index];
          for (let j = 0; j < arr2.length; j++) {
            const a2 = arr2[j];
            if (a1.path === a2.path) {
              return a1
            }
          }
        }
        return {}
      }
      const parentNodeInSNode = getCommonElements(siblingNodes, parents)
      // 父节点的子节点列表已经考虑过了 不需要考虑
      if (index < parents.length - 1 && siblingNodes.length > 0) {
        const sTargetParams = traverseArrayInPattern(siblingNodes, parentNodeInSNode.childIndex, siblingNodeConfirmOnlyNodeParams)
        if (sTargetParams) {
          result.targetParams = sTargetParams;
          // 兄弟节点存在确定节点时 offset偏移到祖先节点 然后生成getChild
          let fnCode = genFnCode(parents, index)
          result.fnCode = fnCode
          return result
        }
      }
      const pTargetParams = siblingNodeConfirmOnlyNodeParams(p)
      if (pTargetParams) {
        // 祖先节点存在确定节点时 生成getChild
        result.targetParams = pTargetParams
        let fnCode = genFnCode(parents, index)
        result.fnCode = fnCode
        return result
      }
    }
    return result
  }
  // 设定了锚节点的情况
  if (anchNode) {
    let { fnCode, params } = getFnByAnchNode(anchNode, handlerNode.node);
    // 如果处理成功 赋值
    if (params) {
      result.targetParams = params
      result.fnCode = fnCode
    }
  }
  // 当前节点就是唯一确定节点
  if (!result.targetParams) {
    result.targetParams = innerConfirmOnlyNodeParams(handlerNode)
  }
  // 看父节点的子节点数组中是否存在唯一确定节点 然后通过offset确定
  if (!result.targetParams) {
    result.targetParams = traverseArrayInPattern(siblingNodes, childIndex, siblingNodeConfirmOnlyNodeParams)
  }
  // 无需设定锚节点，根据目标节点的祖先节点及其兄弟节点找到确定节点然后自动生成并替换
  if (!result.targetParams) {
    let getOnlyNodeByParentResult = getOnlyNodeByParent(handlerNode.node, handlerNode)
    // 如果处理成功 赋值
    if (getOnlyNodeByParentResult.targetParams) {
      result = getOnlyNodeByParentResult
    }
  }

  return result
}

/** 生成脚本文件 
 * 遍历两次树 第一次获取所有目标节点 第二次根据目标节点属性进行逻辑判断
 * @param {*} templateTs 模版ts
 */
function formatTargetTs(templateTs) {
  return new Promise((resolve, rej) => {
    const resultMap = {}
    const parser = xml2js.Parser({ explicitArray: true });
    fs.readFile(xmlPath, function (err, data) {
      parser.parseString(data, function (err, res) {
        const rootNode = res.map.node[0];
        // 第一次获取所有目标节点的特殊处理
        function getTargetNodesMatch(node) {
          if (node.AutoTryNode) {
            if (node.AutoTryNode === 'checkoutUrl') {
              checkoutUrl = node.Text
            } else {
              targetNodeMap[node.AutoTryNode].handled = true;
              targetNodeMap[node.AutoTryNode].node = node;
              targetNodeMap[node.AutoTryNode].Text = node.Text;
              targetNodeMap[node.AutoTryNode].ID = node.ID;
              // === 'android.view.View' ? '' : node.ClassName;
              targetNodeMap[node.AutoTryNode].ClassName = node.ClassName
              targetNodeMap[node.AutoTryNode].childIndex = node.childIndex;
              targetNodeMap[node.AutoTryNode].siblingNodes = removeElementAtIndex(node.parents[node.parents.length - 1].children, node.childIndex);
            }
          }
          // 如果设置了锚节点 就收集起来，这个优先级最高
          if (node.AnchNodeType) {
            targetNodeMap[node.AnchNodeType].anchNode = node
          }
        }
        // 第二次处理节点的特殊处理
        function getTargetNodesEqualMatch(node) {
          eachObj(targetNodeMap, (key, val) => {
            if (val.handled) {
              // 如果是相同节点则不处理
              if (val.node.path === node.path) {
                return
              }
              let { Text, ClassName, equalTexts, equalClassNames } = val
              if (Text) {
                if (Text === node.Text && equalTexts.length === 0) {
                  equalTexts.push(node)
                }
              }
              if (ClassName) {
                if (ClassName === node.ClassName && equalClassNames.length === 0) {
                  equalClassNames.push(node)
                }
              }
            }
          })
        }
        /** 第一次递归xml树 进行属性赋值操作
         * 
         * @param {*} node 目标处理节点
         * @param {*} parents 目标处理节点的祖先节点
         * @param {*} childIndex 目标处理节点在父节点的子节点数组中的索引
         * @returns 
         */
        function recursion(node, parents = [], childIndex = -1) {
          // let currentNodeAttrObj = JSON.parse(JSON.stringify(node.$));
          let currentNodeAttrObj = node.$;
          if (!currentNodeAttrObj) {
            return;
          }
          let childNode = node.node;
          // let handledChildNode = JSON.parse(JSON.stringify(childNode));
          currentNodeAttrObj.parents = [...parents];
          currentNodeAttrObj.childIndex = childIndex;
          currentNodeAttrObj.children = childNode ? childNode.map(child => child.$) : [];
          getTargetNodesMatch(currentNodeAttrObj);
          if (childNode) {
            let { parents, ...parentNode } = currentNodeAttrObj;
            let newParents = [...parents, parentNode];
            childNode.forEach((n, index) => {
              //   if (Array.isArray(n)) {
              //     n.forEach((a) => recursion(a));
              //   } else {
              recursion(n, newParents, index);
              //   }
            });
          }
        }
        /** 第一次递归xml树 进行AutoNodes属性值匹配操作
         * 
         * @param {*} node 
         * @returns 
         */
        function recursionTwo(node) {
          let currentNodeAttrObj = node.$;
          if (!currentNodeAttrObj) {
            return;
          }
          getTargetNodesEqualMatch(currentNodeAttrObj);
          let childNode = node.node;
          if (childNode) {
            childNode.forEach((n) => {
              //   if (Array.isArray(n)) {
              //     n.forEach((a) => recursion(a));
              //   } else {
              recursionTwo(n);
              //   }
            });
          }
        }
        // 第一次获取所有目标节点 并添加特定属性
        recursion(rootNode);
        // 第二次根据目标节点属性进行逻辑判断
        // const rootNode2 = JSON.parse(JSON.stringify(res.map.node[0]));
        recursionTwo(rootNode);
        let errMessage = ''
        eachObj(targetNodeMap, (key, val) => {
          if (val.handled) {
            const result = formatConfirmOnlyNodeParam(val, key)
            const params = result.targetParams
            if (!params || Object.keys(params).length === 0) {
              errMessage += `${key} 自动生成失败\n`
              // vscodeApi.$log(`${key} 节点信息==== ${JSON.stringify(val)}`)
            } else {
              resultMap[key] = result
            }
          } else {
            errMessage += (`${key} 未添加 AutoNode 请留意=====\n`)
          }
        })
        vscodeApi.$log('========= 以下为异常情况节点 =========')
        vscodeApi.$log(errMessage)
        // console.log(`resultMap ==== ${JSON.stringify(resultMap)}`);
        eachObj(resultMap, (key, val) => {
          let paramsReplaceHolder = `// ${key}-ReplaceHolder`
          let paramsVal = `${key}: ${JSON.stringify(val.targetParams, null, 4)},`
          templateTs = templateTs.replace(paramsReplaceHolder, paramsVal)
          let fnCodeReplaceHolder = `// get${capitalizeFirstLetter(key)}-ReplaceHolder`
          let fnCodeValue = val.fnCode
          templateTs = templateTs.replace(fnCodeReplaceHolder, fnCodeValue)
        })
        // 函数替换成默认值
        eachObj(targetNodeMap, (key, val) => {
          if (!resultMap[key]) {
            let paramsReplaceHolder = `// ${key}-ReplaceHolder`
            templateTs = templateTs.replace(paramsReplaceHolder, val.defaultParams)
            let fnCodeReplaceHolder = `// get${capitalizeFirstLetter(key)}-ReplaceHolder`
            templateTs = templateTs.replace(fnCodeReplaceHolder, val.defaultFnCode)
          }
        })
        resolve(templateTs)
      });
    });
  })
}

module.exports = {
  name,
  implementation: async function () {
    try {
      vscodeApi.$log(`业务流程熟悉可见文档 https://uathzwgnr7.feishu.cn/docx/ZKS8drLFVocq7IxwUNRciTA2n9f`)
      vscodeApi.$log(`工具实现思路可见文档 https://uathzwgnr7.feishu.cn/docx/YCVVdzFxFoDyrjxFqyoc7m4dnfe`)
      vscodeApi.$log(` ==========================`)
      // 使用根据xml自动检测生成节点功能
      let useAutoNodeGene = false
      xmlPath = vscodeApi.currentDocumentPath;
      let vscodeRootPath = await vscodeApi.getRelativeRootPromise();
      xmlStr = await readFileContent(xmlPath)
      if (!xmlPath.endsWith(".xml")) {
        vscodeApi.$toast().err('请打开xml文件')
        return
      }
      let choose = await vscodeApi.$confirm("是否使用脚本节点自动检测功能", "是", "否")
      if (choose === '是') {
        useAutoNodeGene = true
        if (countOccurrences(xmlStr, 'AutoTryNode') === 0) {
          vscodeApi.$toast('AutoTryNode未设置 请使用ctrl+shift+v快捷键在xml中设置后再次运行')
          return
        }
      } else {
        useAutoNodeGene = false
      }
      vscodeApi.$log('AutoTry====店铺信息生成 begin')
      let storeName = await vscodeApi.$showInputBox({
        placeHolder:
          "请输入店铺名",
      });
      vscodeApi.$log(`AutoTry====店铺名 === ${storeName} 👌`)
      let storeFolderName = removeSpecialCharactersAndLowerCase(storeName)
      let storeID = await vscodeApi.$showInputBox({
        placeHolder:
          "请输入店铺ID",
      });
      vscodeApi.$log(`AutoTry====店铺ID === ${storeID} 👌`)
      let platform = await vscodeApi.$quickPick(['web', 'app'], {
        placeHolder: '请输入平台',
      })
      vscodeApi.$log(`AutoTry====平台 === ${platform} 👌`)
      let country = await vscodeApi.$quickPick(['us', 'gb', 'fr', 'de'], {
        placeHolder:
          "请输入国家缩写"
      });
      vscodeApi.$log(`AutoTry====国家 === ${country} 👌`)
      let folderPath = `${vscodeRootPath}/src/stores/${storeFolderName}`
      await nodeApi.doShellCmd(`mkdir ${folderPath}`);
      let platformFolderPath = `${folderPath}/${platform}/`
      await nodeApi.doShellCmd(`mkdir ${platformFolderPath}`);
      let metaStr = `[
        {
          "storeId": "${storeID}",
          "name": "${storeName}",
          "iconUrl": "https://images.dev.rp.al-array.com/icons/${storeID}.webp",
          "client": "${platform}",
          "script": "${platform}/${country}.ts"
        }
      ]
      `
      await nodeApi.writeFileRecursive(
        `${folderPath}/meta.json`,
        metaStr
      );
      // 开始处理脚本文件
      vscodeApi.$log('开始处理脚本文件======')
      // 处理模版路径逻辑
      // 1. 获取指定模版文件str
      // 2. 如果用户xml下没有模版文件 提示用户可以使用默认模版
      let templateTs = '' // 模版路径
      let targetTs = `${platformFolderPath}${country}.ts`;
      if (useAutoNodeGene) {
        templateTs = `${vscodeRootPath}/xml/replaceHolder-template.ts`
        let templateIsExist = await checkFileExistsAsync(templateTs)
        if (!templateIsExist) {
          let chooseTs = await vscodeApi.$confirm("请配置xml/replaceHolder-template.ts 是否采用并生成默认模版", "是", "否")
          if (chooseTs === '是') {
            templateTs = replaceHolderTemplateTs
            await nodeApi.doShellCmd(`cp ${replaceHolderTemplateTs} ${vscodeRootPath}/xml/replaceHolder-template.ts`)
          } else {
            vscodeApi.$toast('请配置xml/replaceHolder-template.ts后再次执行')
            return
          }
        }
      } else {
        templateTs = `${vscodeRootPath}/xml/template.ts`
        let templateTs = `${vscodeRootPath}/xml/template.ts`
        let templateTsIsExist = await checkFileExistsAsync(templateTs)
        if (!templateTsIsExist) {
          let chooseTs = await vscodeApi.$confirm("请配置xml/template.ts 是否采用并生成默认模版", "是", "否")
          if (chooseTs === '是') {
            templateTs = commonTemplateTs
            await nodeApi.doShellCmd(`cp ${commonTemplateTs} ${vscodeRootPath}/xml/template.ts`)
          } else {
            vscodeApi.$toast('请配置xml/template.ts后再次执行')
            return
          }
        }
      }
      templateStr = await readFileContent(templateTs)
      // 使用根据xml自动检测生成节点功能
      if (useAutoNodeGene) {
        // 获取模版文件
        // vscodeApi.$toast('开始生成ts脚本。。。')
        let handledTemplateStr = await formatTargetTs(templateStr)
        if (!checkoutUrl) {
          checkoutUrl = await vscodeApi.$showInputBox({
            placeHolder:
              "请输入目标网址 checkoutUrl",
          });
        }
        function escapeRegExpString(inputString) {
          return inputString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\//g, '\\/');
        }
        checkoutUrl = new RegExp(escapeRegExpString(checkoutUrl))
        vscodeApi.$log(`AutoTry====目标网址checkoutUrl === ${checkoutUrl} 👌`)
        handledTemplateStr = handledTemplateStr.replace('"checkoutUrl-ReplaceHolder"', checkoutUrl)
        handledTemplateStr = handledTemplateStr.replace("'checkoutUrl-ReplaceHolder'", checkoutUrl)
        await nodeApi.writeFileRecursive(
          targetTs,
          handledTemplateStr
        );
      } else {
        // 不使用根据xml自动检测生成节点功能 则直接将模版文件重命名移动即可
        await nodeApi.doShellCmd(`cp ${templateTs} ${targetTs}`)
      }
      let startCmd = `ENTRY=${storeFolderName}/${platform}/${country}.ts npm run start`;
      // vscodeApi.clipboardWriteText(`gac "feat: ${storeFolderName}脚本完成" && gp`)
      vscodeApi.clipboardWriteText(startCmd)
      vscodeApi.$log(`脚本生成成功✅✅✅ 脚本执行命令 === ${startCmd}`)
      vscodeApi.$log(`脚本完成后提交命令 === git add . && git commit -m "feat: ${storeName}脚本完成" && git push`)
      vscodeApi.$toast('脚本生成成功✅✅✅ 脚本执行命令已生成至剪切板 可直接粘贴执行')
    } catch (error) {
      vscodeApi.$toast().err("执行失败 错误原因见OUTPUT面板日志");
      vscodeApi.$log(error.message || error.stderr);
    }

  },
};
