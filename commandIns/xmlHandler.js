let name = "xmlHandler";
const fs = require("fs");
const xml2js = require("xml2js");
const { eachObj } = require("../utils");
const nodeApi = require("../utils/node-api");
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);

/**
 * 将xml转为json
 * 1. 获取到每个节点
 * 2. 为每个节点祖先节点数组属性 parents 和 在父节点的子数组中的索引 childIndex
 * 3. 将两个parents对比共同父节点 comParent
 * 找到相对根节点的深度y 和 相对父节点子节点数组位置x
 * 4. 锚节点到公共父节点需要向上查找的次数 = 锚节点parents.length - comParent在锚节点parents索引
 * 5. 公共父节点到目标节点需要向下查找到次数 = 目标点parents 在 comParent之后元素的childIndex
 *
 * [getParentNumber，[...childrenIndexs]] 锚节点到公共父节点需要向上查找的次数；公共父节点到目标节点需要向下查找到次数，组成元素是下一个节点在数组中的索引
 */
function recursionWrap(node, anchNodeMatch, targetNodeMatch) {
  let anchorNode;
  let targetNode;
  if (typeof anchNodeMatch === "string") {
    anchNodeMatch = {
      Text: anchNodeMatch,
    };
  }
  if (typeof targetNodeMatch === "string") {
    targetNodeMatch = {
      Text: targetNodeMatch,
    };
  }
  function isMatch(obj1, obj2) {
    for (var key in obj2) {
      if (obj1[key] !== obj2[key]) {
        return false;
      }
    }
    return true;
  }
  function match(node) {
    if (isMatch(node, anchNodeMatch)) {
      anchorNode = node;
    }
    if (isMatch(node, targetNodeMatch)) {
      targetNode = node;
    }
  }
  function recursion(node, parents = [], parentIndex = -1) {
    let currentNodeAttrObj = node.$;
    if (!currentNodeAttrObj) {
      return;
    }
    let childNode = node.node;
    currentNodeAttrObj.parents = [...parents];
    currentNodeAttrObj.childIndex = parentIndex;
    match(currentNodeAttrObj);
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
  recursion(node);
  if (anchorNode && targetNode) {
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
      const { parents, ...anchNodeWithoutParent } = anchorNode;
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

    return {
      commonParentInfo: {
        node: commonParent,
        anchStep,
        targetStep,
        targetChildIndexArr,
      },
      anchorNode,
      targetNode,
    };
  } else if (!anchorNode) {
    vscodeApi.$toast().err("锚节点查找失败");
  } else if (!targetNode) {
    vscodeApi.$toast().err('请在目标节点上添加 targetNode="true" 并保存');
  }
}
function parseAttributes(attributeString) {
  const regex = /(\w+)=("(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\S+(?!=))/g;
  const attributes = {};

  let match;
  while ((match = regex.exec(attributeString)) !== null) {
    const [, attributeName, attributeValue1, attributeValue2, attributeValue3] =
      match;
    const attributeValue = attributeValue1
      ? attributeValue1.replace(/^["']|["']$/g, "")
      : attributeValue2
      ? attributeValue2.replace(/^["']|["']$/g, "")
      : attributeValue3;
    attributes[attributeName] = attributeValue;
  }

  return attributes;
}

module.exports = {
  name,
  implementation: async function () {
    try {
      const targetNodeMatch = {
        targetNode: "true",
      };
      let anchNodeMatch; // 锚节点属性对象
      // let vscodeRootPath = await vscodeApi.getRelativeRootPromise();
      let xmlPath = vscodeApi.currentDocumentPath;
      // let targetOutputPath = vscodeRootPath + "/targetXmlNode.js"; // 目标xml文件的默认路径
      // if (url && url.path) {
      //   xmlPath = url.path;
      // }
      vscodeApi.log("开始执行xml");
      let content = vscodeApi.selectText.trim();
      if (content === "") {
        vscodeApi.$toast("请选中锚节点属性");
        return;
      }
      // let targetNodeText = await vscodeApi.$showInputBox({
      //   placeHolder:
      //     "请输入目标节点的Text值，建议自己写一个，默认 111111 (即6个1)",
      //   value: "111111",
      // });
      // if (!targetNodeText) {
      //   targetNodeText = "111111";
      // }
      anchNodeMatch = parseAttributes(content);
      const parser = xml2js.Parser({ explicitArray: true });
      fs.readFile(xmlPath, function (err, data) {
        parser.parseString(data, function (err, res) {
          // console.dir(res);
          // console.log(err, "=====", JSON.stringify(res));
          // var result = findCommonParentAndChildren(
          //   res.map.node[0],
          //   {
          //     Text: "Add tip",
          //     ClassName: "android.view.View",
          //   },
          //   {
          //     Text: "11111111",
          //   }
          // );
          var result = recursionWrap(
            res.map.node[0],
            anchNodeMatch,
            targetNodeMatch
          );
          console.log("result===", result);
          if (result) {
            let { commonParentInfo, targetNode } = result;
            // console.log(err, "=====", res.map);
            // recursion(res.map.node);
            let { anchStep, targetChildIndexArr } = commonParentInfo;
            targetChildIndexArr.push(targetNode.childIndex);
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
              Text: "exactText",
              ID: "exactResourceId",
              ClassName: "exactClassName",
            };
            let params = {};
            eachObj(anchNodeMatch, (key, val) => {
              if (paramsObjMatch[key]) {
                // 如果属性值为空就不添加在匹配条件中
                if (val) {
                  params[paramsObjMatch[key]] = val;
                }
              } else {
                vscodeApi.log(`${key}不存在对应处理属性`);
              }
            });
            let targetOutput = `
const anchNode = await findNodeAsync(${JSON.stringify(params)});\n
return anchNode${getParentStr}${getChildrenStr}
`;
            vscodeApi.log(targetOutput);
            vscodeApi.$toast(`生成关系结果成功并复制到剪切板中 请直接粘贴使用`);
            vscodeApi.clipboardWriteText(targetOutput);
            // nodeApi.writeFileRecursive(targetOutputPath, targetOutput);
          }
          // console.log(result.anchorNode.parents.length);
          // console.log(result.targetNode.parents.length);
        });
      });
    } catch (error) {
      vscodeApi.$toast().err("执行失败 错误原因见OUTPUT面板日志");
      vscodeApi.log(error.message);
    }
  },
};
