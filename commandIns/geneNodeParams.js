let name = "geneNodeParams";
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const VscodeApi = require("../utils/vscode-api");
const nodeApi = require("../utils/node-api");
const xml2js = require("xml2js");
const { eachObj } = require("../utils");
let vscodeApi = new VscodeApi(name);
let templateStr = ""; // ts模版字符串内容
let xmlStr = ""; // xml字符串内容
let oriXmlStr = ""; // 原始的xml字符串内容
let xmlPath = ""; // xml路径
let commonTemplateTs = path.join(__dirname, "./applovin/auto-try/template.ts");
let replaceHolderTemplateTs = path.join(
  __dirname,
  "./applovin/auto-try/replaceHolder-template.ts"
);
let checkoutUrl = "";
let oriCheckUrl = "";
/**
 * 1. 如果meta.json存在则取出原数组添加一项再写回meta.json；
 * 2. 如果meta.json不存在则将对象放在数组中存入meta.json
 * @param {*} data
 */
function writeToMetaFile(data, filePath) {
  // const filePath = path.join(__dirname, 'meta.json'); // 文件路径

  // 读取现有数据或创建一个空数组
  let dataArray = [];
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    dataArray = JSON.parse(fileContent);
  }

  // 添加新数据到数组
  dataArray.push(data);

  // 将更新后的数组写入文件
  fs.writeFileSync(filePath, JSON.stringify(dataArray, null, 2), "utf-8");

  console.log("数据已写入 meta.json 文件");
}
/** 字符串首字母转大写
 *
 * @param {*} str
 * @returns
 */
function capitalizeFirstLetter(str) {
  // 将首字母转换为大写，再拼接剩余部分
  return str.charAt(0).toUpperCase() + str.slice(1);
}
/** 获取节点类型对应的get函数
 *
 * @param {*} nodeType
 * @param {*} archNodeStr 根据锚节点生成的代码片段 需要返回target 如果没有则走默认逻辑
 * @returns
 */
function getFnCode(nodeType, archNodeStr) {
  // 如果没有根据锚节点生成则使用默认方法
  if (!archNodeStr) {
    archNodeStr = ` const target = await findNodeAsync(params.${nodeType}!)`;
  }
  let defaultFnCode = `const get${capitalizeFirstLetter(
    nodeType
  )} = async () => {
    ${archNodeStr}
    info(\`${nodeType} target ====\${target} \`)
    return target
  };`;
  if (nodeType === "price") {
    defaultFnCode = `const getPrice = async () => {
    ${archNodeStr}
    info(\`target ====\${target} \`)
    info(\`current price before ====\${ target?.getText() || '' } \`)
    const regex = /[^\\d£$.,€]+/g;
    const amount = (target?.getText() || "").replace(regex, "");
    info(\`current price ====\${ amount } \`);
    const price = getPriceFromText(amount);
    info(\`current price handled ====\${ price.value } \`);
    return price
  };`;
  }
  return defaultFnCode;
}

// 目标属性处理对象
const targetNodeMap = {
  codeEntry: {
    node: null, // 源节点
    Text: null, // Text内容
    ID: null, // ID
    siblingNodes: [], // 兄弟节点数组
    equalTexts: [], // 相同Text的节点数组
    equalClassNames: [], // 相同类名的节点数组
    defaultFnCode: "",
  },
  codeInput: {
    node: null, // 源节点
    Text: null, // Text内容
    ID: null, // ID
    siblingNodes: [], // 兄弟节点数组
    equalTexts: [], // 相同Text的节点数组
    equalClassNames: [], // 相同类名的节点数组
    defaultFnCode: "",
  },
  applyButton: {
    node: null, // 源节点
    Text: null, // Text内容
    ID: null, // ID
    siblingNodes: [], // 兄弟节点数组
    equalTexts: [], // 相同Text的节点数组
    equalClassNames: [], // 相同类名的节点数组
    defaultFnCode: "",
  },
  price: {
    node: null, // 源节点
    Text: null, // Text内容
    ID: null, // ID
    siblingNodes: [], // 兄弟节点数组
    equalTexts: [], // 相同Text的节点数组
    equalClassNames: [], // 相同类名的节点数组
    defaultFnCode: "",
  },
};
// 可能添加在xml中的内容
const geneStrArr = [];
// 处理一些默认值
eachObj(targetNodeMap, (key, val) => {
  val.defaultFnCode = getFnCode(key);
  let defaultParams = `${key}: {
      exactText: '${key}填充文案 不写属性会堵塞运行',
    },`;
  val.defaultParams = defaultParams;
  geneStrArr.push(`AutoTryNode="${key}"`);
  geneStrArr.push(`AnchNodeType="${key}"`);
});
// 读取指定路径文件并返回文件内容字符串
function readFileContent(filePath) {
  // 将 fs.readFile 方法转换成 Promise 形式
  const readFilePromise = promisify(fs.readFile);
  return readFilePromise(filePath, "utf8");
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
// 封装一个创建文件夹的异步函数
async function createFolderIfNotExists(folderPath) {
  if (await checkFileExistsAsync(folderPath)) {
    // 文件夹已存在，无需创建
    return;
  }
  // 文件夹不存在，执行创建命令
  await nodeApi.doShellCmd(`mkdir ${folderPath}`);
}

function removeSpecialCharactersAndLowerCase(input) {
  // 去除特殊字符和空格
  const cleanedString = input.replace(/[^\w\s]/g, "").replace(/\s+/g, "");
  // 将字符串转换为全小写
  const lowerCaseString = cleanedString.toLowerCase();
  return lowerCaseString;
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
  let offset = null;
  let leftIndex = startIndex - 1;
  let rightIndex = startIndex + 1;
  let step = 1;
  let count = 0;

  while (count < arr.length - 1) {
    if (leftIndex >= 0 && !anchTargetParams) {
      anchTargetParams = confirmFn(arr[leftIndex]);
      count++;
      offset = startIndex - leftIndex;
    }
    if (rightIndex < arr.length && !anchTargetParams) {
      anchTargetParams = confirmFn(arr[rightIndex]);
      count++;
      offset = startIndex - rightIndex;
    }
    if (anchTargetParams) {
      return {
        ...anchTargetParams,
        offset,
      };
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
  const regex = new RegExp(`['"]${searchString}['"]`, "g");
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
  const newArr = arr
    .slice(0, indexToRemove)
    .concat(arr.slice(indexToRemove + 1));

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
  let isCodeInputOrPrice = nodeType === "codeInput" || nodeType === "price";
  let { siblingNodes, childIndex, anchNode } = handlerNode;
  let result = {
    fnCode: targetNodeMap[nodeType].defaultFnCode,
    targetParams: null,
  };
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
      const { parents, AnchNodeType, children, ...anchNodeWithoutParent } =
        anchorNode;
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
      getParentStr += "?.getParent()";
    }
    for (let index = 0; index < targetChildIndexArr.length; index++) {
      const childIndex = targetChildIndexArr[index];
      getChildrenStr += `?.getChild(${childIndex})`;
    }

    let paramsObjMatch = {
      Text: "exactText",
      ID: "exactResourceId",
      ClassName: "exactClassName",
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

    let targetArchStr = `const anchNode = await findNodeAsync(params.${nodeType});
      info(\`${nodeType} anchNode ==== \${ anchNode }\`)
      const target = anchNode${getParentStr}${getChildrenStr}
};`;
    let targetFnCode = getFnCode(nodeType, targetArchStr);
    vscodeApi.$log(targetFnCode);
    return { fnCode: targetFnCode, params };
  }
  function innerConfirmOnlyNodeParams(innerHandlerNode) {
    let { ID, Text, ClassName, equalTexts, equalClassNames } = innerHandlerNode;
    let targetParams = null;
    if (ID && !hasDigit(ID)) {
      targetParams = {
        exactResourceId: ID,
      };
    } else {
      if (isCodeInputOrPrice) {
        if (ClassName) {
          if (equalClassNames.length === 0) {
            targetParams = {
              exactClassName: ClassName,
            };
          }
        }
      } else {
        if (Text && !hasDigit(Text)) {
          if (equalTexts.length === 0) {
            targetParams = {
              exactText: Text,
            };
          } else {
            if (ClassName && equalClassNames.length === 0) {
              targetParams = {
                exactText: Text,
                exactClassName: ClassName,
              };
            }
          }
        } else if (ClassName) {
          if (equalClassNames.length === 0) {
            targetParams = {
              exactClassName: ClassName,
            };
          }
        }
      }
    }
    return targetParams;
  }
  /** 判断兄弟节点是否是确定唯一节点
   *
   * @param {*} siblingNode
   * @returns
   */
  function siblingNodeConfirmOnlyNodeParams(siblingNode) {
    let { ID, Text, ClassName } = siblingNode;
    let targetParams = null;
    if (ID && !hasDigit(ID)) {
      targetParams = {
        exactResourceId: ID,
      };
    } else {
      if (Text && !hasDigit(Text)) {
        if (countOccurrencesWithQuotes(oriXmlStr, Text) === 1) {
          targetParams = {
            exactText: Text,
          };
        } else {
          if (
            ClassName &&
            countOccurrencesWithQuotes(oriXmlStr, ClassName) === 1
          ) {
            targetParams = {
              exactText: Text,
              exactClassName: ClassName,
            };
          }
        }
      } else if (ClassName) {
        if (countOccurrencesWithQuotes(oriXmlStr, Text) === 1) {
          targetParams = {
            exactClassName: ClassName,
          };
        }
      }
    }
    return targetParams;
  }
  /** 根据目标节点的祖先节点及其兄弟节点找到确定节点
   *
   * @param {*} node
   */
  function getOnlyNodeByParent(node, handlerNode) {
    let parents = node.parents;

    let result = {
      fnCode: "",
      targetParams: null,
    };
    function genFnCodeByParentNodeIndexInParents(
      parents,
      parentNodeIndexInParents
    ) {
      // let parentNodeIndexInParents = parents.indexOf(parentNode)
      let targetChildIndexArr = [];
      let getChildrenStr = "";
      targetChildIndexArr = parents
        // 已经根据offset处理了本身 所以再次+1
        .slice(parentNodeIndexInParents + 1 + 1)
        .map((a) => a.childIndex);
      targetChildIndexArr.push(handlerNode.childIndex);
      for (let index = 0; index < targetChildIndexArr.length; index++) {
        const childIndex = targetChildIndexArr[index];
        getChildrenStr += `?.getChild(${childIndex})`;
      }
      let anchNodeStr = `const anchNode = await findNodeAsync(params.${node.AutoTryNode});
      info(\`${node.AutoTryNode} anchNode ==== \${ anchNode }\`)
      const target = anchNode${getChildrenStr}
      `;

      let targetOutput = getFnCode(node.AutoTryNode, anchNodeStr);
      vscodeApi.$log(targetOutput);
      return targetOutput;
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
              return a1;
            }
          }
        }
        return {};
      }
      const parentNodeInSNode = getCommonElements(siblingNodes, parents);
      // 父节点的子节点列表已经考虑过了 不需要考虑
      if (index < parents.length - 1 && siblingNodes.length > 0) {
        const sTargetParams = traverseArrayInPattern(
          siblingNodes,
          parentNodeInSNode.childIndex,
          siblingNodeConfirmOnlyNodeParams
        );
        if (sTargetParams) {
          result.targetParams = sTargetParams;
          // 兄弟节点存在确定节点时 offset偏移到祖先节点 然后生成getChild
          let fnCode = genFnCodeByParentNodeIndexInParents(parents, index);
          result.fnCode = fnCode;
          return result;
        }
      }
      const pTargetParams = siblingNodeConfirmOnlyNodeParams(p);
      if (pTargetParams) {
        // 祖先节点存在确定节点时 生成getChild
        result.targetParams = pTargetParams;
        let fnCode = genFnCodeByParentNodeIndexInParents(parents, index);
        result.fnCode = fnCode;
        return result;
      }
    }
    return result;
  }
  // 设定了锚节点的情况
  if (anchNode) {
    let { fnCode, params } = getFnByAnchNode(anchNode, handlerNode.node);
    // 如果处理成功 赋值
    if (params) {
      result.targetParams = params;
      result.fnCode = fnCode;
    }
  }
  // 当前节点就是唯一确定节点
  if (!result.targetParams) {
    result.targetParams = innerConfirmOnlyNodeParams(handlerNode);
  }
  // 看父节点的子节点数组中是否存在唯一确定节点 然后通过offset确定
  if (!result.targetParams) {
    result.targetParams = traverseArrayInPattern(
      siblingNodes,
      childIndex,
      siblingNodeConfirmOnlyNodeParams
    );
  }
  // 无需设定锚节点，根据目标节点的祖先节点及其兄弟节点找到确定节点然后自动生成并替换
  if (!result.targetParams) {
    let getOnlyNodeByParentResult = getOnlyNodeByParent(
      handlerNode.node,
      handlerNode
    );
    // 如果处理成功 赋值
    if (getOnlyNodeByParentResult.targetParams) {
      result = getOnlyNodeByParentResult;
    }
  }

  return result;
}

function formatTargetTs() {
  return new Promise((resolve, rej) => {
    const resultMap = {};
    const parser = xml2js.Parser({ explicitArray: true });
    fs.readFile(xmlPath, function (err, data) {
      parser.parseString(data, function (err, res) {
        const rootNode = res.map.node[0];
        // 第一次获取所有目标节点的特殊处理
        function getTargetNodesMatch(node) {
          if (node.AutoTryNode) {
            if (node.AutoTryNode === "checkoutUrl") {
              checkoutUrl = node.Text;
            } else {
              targetNodeMap[node.AutoTryNode].handled = true;
              targetNodeMap[node.AutoTryNode].node = node;
              targetNodeMap[node.AutoTryNode].Text = node.Text;
              targetNodeMap[node.AutoTryNode].ID = node.ID;
              // === 'android.view.View' ? '' : node.ClassName;
              targetNodeMap[node.AutoTryNode].ClassName = node.ClassName;
              targetNodeMap[node.AutoTryNode].childIndex = node.childIndex;
              targetNodeMap[node.AutoTryNode].siblingNodes =
                removeElementAtIndex(
                  node.parents[node.parents.length - 1].children,
                  node.childIndex
                );
            }
          }
          // 如果设置了锚节点 就收集起来，这个优先级最高
          if (node.AnchNodeType) {
            targetNodeMap[node.AnchNodeType].anchNode = node;
          }
        }
        // 第二次处理节点的特殊处理
        function getTargetNodesEqualMatch(node) {
          eachObj(targetNodeMap, (key, val) => {
            if (val.handled) {
              // 如果是相同节点则不处理
              if (val.node.path === node.path) {
                return;
              }
              let { Text, ClassName, equalTexts, equalClassNames } = val;
              if (Text) {
                if (Text === node.Text && equalTexts.length === 0) {
                  equalTexts.push(node);
                }
              }
              if (ClassName) {
                if (
                  ClassName === node.ClassName &&
                  equalClassNames.length === 0
                ) {
                  equalClassNames.push(node);
                }
              }
            }
          });
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
          currentNodeAttrObj.children = childNode
            ? childNode.map((child) => child.$)
            : [];
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
        let errMessage = "";
        eachObj(targetNodeMap, (key, val) => {
          if (val.handled) {
            const result = formatConfirmOnlyNodeParam(val, key);
            const params = result.targetParams;
            if (!params || Object.keys(params).length === 0) {
              errMessage += `${key} 自动生成失败\n`;
              // vscodeApi.$log(`${key} 节点信息==== ${JSON.stringify(val)}`)
            } else {
              resultMap[key] = result;
            }
          } else {
            errMessage += `${key} 未添加 AutoNode 请留意=====\n`;
          }
        });
        vscodeApi.$log("========= 以下为异常情况节点 =========");
        vscodeApi.$log(errMessage);
        resolve(resultMap);
      });
    });
  });
}

module.exports = {
  name,
  implementation: async function () {
    try {
      vscodeApi.$log(
        `业务流程熟悉可见文档 https://uathzwgnr7.feishu.cn/docx/ZKS8drLFVocq7IxwUNRciTA2n9f`
      );
      vscodeApi.$log(
        `工具实现思路可见文档 https://uathzwgnr7.feishu.cn/docx/YCVVdzFxFoDyrjxFqyoc7m4dnfe`
      );
      vscodeApi.$log(` ==========================`);
      // 使用根据xml自动检测生成节点功能
      xmlPath = vscodeApi.currentDocumentPath;
      xmlStr = await readFileContent(xmlPath);
      geneStrArr.forEach((addStr) => {
        oriXmlStr = xmlStr.replace(addStr, "");
      });
      if (!xmlPath.endsWith(".xml")) {
        vscodeApi.$toast().err("请打开xml文件");
        return;
      }
      if (countOccurrences(oriXmlStr, "AutoTryNode") === 0) {
        vscodeApi.$toast(
          "AutoTryNode未设置 请使用ctrl+shift+v快捷键在xml中设置后再次运行"
        );
        return;
      }
      // 获取模版文件
      // vscodeApi.$toast('开始生成ts脚本。。。')
      let res = await formatTargetTs();
      vscodeApi.$log(res);
      let vscodeRootPath = await vscodeApi.getRelativeRootPromise();
      function writeDataToFile(fileName, data, filePath) {
        const content = `
//  ======= ${fileName} =====
// 对应参数
let ${fileName} = ${JSON.stringify(data.targetParams, null, 2)}
// 获取函数
${data.fnCode}
  `;

        fs.appendFileSync(filePath, content, "utf-8");
      }

      function writeResDataToSingleFile(res, fileName) {
        const filePath = path.join(vscodeRootPath, fileName);
        fs.writeFileSync(filePath, "", "utf-8");

        for (const key in res) {
          if (Object.hasOwnProperty.call(res, key)) {
            writeDataToFile(key, res[key], filePath);
          }
        }
      }

      writeResDataToSingleFile(res, "xml/result.js");
    } catch (error) {
      vscodeApi.$toast().err("执行失败 错误原因见OUTPUT面板日志");
      vscodeApi.$log(error.message || error.stderr);
    }
  },
};
