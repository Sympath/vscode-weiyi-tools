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
// 目标属性处理对象
const targetNodeMap = {
  codeEntry: {
    node: null, // 源节点
    Text: null, // Text内容
    ID: null, // ID
    siblingNodes: [], // 兄弟节点数组
    equalTexts: [],// 相同Text的节点数组
    equalClassNames: [] // 相同类名的节点数组
  },
  codeInput: {
    node: null, // 源节点
    Text: null, // Text内容
    ID: null, // ID
    siblingNodes: [], // 兄弟节点数组
    equalTexts: [],// 相同Text的节点数组
    equalClassNames: [] // 相同类名的节点数组
  },
  applyButton: {
    node: null, // 源节点
    Text: null, // Text内容
    ID: null, // ID
    siblingNodes: [], // 兄弟节点数组
    equalTexts: [],// 相同Text的节点数组
    equalClassNames: [] // 相同类名的节点数组
  },
  price: {
    node: null, // 源节点
    Text: null, // Text内容
    ID: null, // ID
    siblingNodes: [], // 兄弟节点数组
    equalTexts: [],// 相同Text的节点数组
    equalClassNames: [] // 相同类名的节点数组
  },
}
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
function formatConfirmOnlyNodeParam(handlerNode, isCodeInputOrPrice = false) {
  let { siblingNodes, childIndex } = handlerNode

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
        if (Text) {
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
      if (Text) {
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
  let targetParams = innerConfirmOnlyNodeParams(handlerNode)
  // 看父节点的子节点数组中是否存在唯一确定节点 然后通过offset确定
  if (!targetParams) {
    targetParams = traverseArrayInPattern(siblingNodes, childIndex, siblingNodeConfirmOnlyNodeParams)
  }
  return targetParams
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
            targetNodeMap[node.AutoTryNode].handled = true;
            targetNodeMap[node.AutoTryNode].node = node;
            targetNodeMap[node.AutoTryNode].Text = node.Text;
            targetNodeMap[node.AutoTryNode].ID = node.ID;
            // === 'android.view.View' ? '' : node.ClassName;
            targetNodeMap[node.AutoTryNode].ClassName = node.ClassName
            targetNodeMap[node.AutoTryNode].childIndex = node.childIndex;
            targetNodeMap[node.AutoTryNode].siblingNodes = removeElementAtIndex(node.parents.pop().children, node.childIndex);
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
            const params = formatConfirmOnlyNodeParam(val, key === 'codeInput' || key === 'price')
            if (!params) {
              errMessage += `${key} 自动生成失败\n`
              // vscodeApi.$log(`${key} 节点信息==== ${JSON.stringify(val)}`)
            }
            resultMap[key] = params
          } else {
            errMessage += (`${key} 未添加 AutoNode 请留意=====\n`)
          }
        })
        vscodeApi.$log(errMessage)
        // console.log(`resultMap ==== ${JSON.stringify(resultMap)}`);
        eachObj(resultMap, (key, val) => {
          templateTs = templateTs.replace(`'${key}-ReplaceHolder'`, JSON.stringify(val, null, 2))
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
      let checkoutUrl = ""
      if (useAutoNodeGene) {
        checkoutUrl = await vscodeApi.$showInputBox({
          placeHolder:
            "请输入目标网址 checkoutUrl",
        });
        function escapeRegExpString(inputString) {
          return inputString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\//g, '\\/');
        }
        checkoutUrl = new RegExp(escapeRegExpString(checkoutUrl))
        vscodeApi.$log(`AutoTry====目标网址checkoutUrl === ${checkoutUrl} 👌`)
      }
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
      let country = await vscodeApi.$quickPick(['us', 'gb', 'fr'], {
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
      let templateTs = `${vscodeRootPath}/xml/template.ts`
      let targetTs = `${platformFolderPath}${country}.ts`;
      let templateIsExist = await checkFileExistsAsync(templateTs)
      if (!templateIsExist) {
        let chooseTs = await vscodeApi.$confirm("请配置xml/template.ts 是否采用并生成默认模版", "是", "否")
        if (chooseTs === '是') {
          templateTs = commonTemplateTs
          await nodeApi.doShellCmd(`cp ${commonTemplateTs} ${vscodeRootPath}/xml/template.ts`)
        } else {
          return
        }
      }
      templateStr = await readFileContent(templateTs)
      // 使用根据xml自动检测生成节点功能
      if (useAutoNodeGene) {
        // 获取模版文件
        // vscodeApi.$toast('开始生成ts脚本。。。')
        let handledTemplateStr = await formatTargetTs(templateStr)
        handledTemplateStr.replace('"checkoutUrl-ReplaceHolder"', checkoutUrl)
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
      vscodeApi.$toast('脚本生成成功✅✅✅ 脚本执行命令已生成至剪切板 可直接粘贴执行')

    } catch (error) {
      vscodeApi.$toast().err("执行失败 错误原因见OUTPUT面板日志");
      vscodeApi.$log(error.message);
    }

  },
};
