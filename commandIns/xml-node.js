let name = "xmlNode";
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);

const fs = require("fs");
const xml2js = require("xml2js");
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
  }
}
function parseAttributes(attributeString) {
  const regex = /(\w+)=("([^"]+)"|'([^']+)'|([^ ]+))/g;
  const attributes = {};

  let match;
  while ((match = regex.exec(attributeString)) !== null) {
    const [
      ,
      attributeName,
      ,
      attributeValue1,
      attributeValue2,
      attributeValue3,
    ] = match;
    const attributeValue =
      attributeValue1 || attributeValue2 || attributeValue3;
    attributes[attributeName] = attributeValue;
  }

  return attributes;
}
module.exports = {
  name,
  implementation: async function (url) {
    // var { dir } = path.parse(url.path);
    // shell.cd(dir);
    // let content = fs.readFileSync(url.path, "utf-8");
    try {
      let content = await vscodeApi.clipboardText;
      if (content === "") {
        vscodeApi.$toast("请复制锚节点的属性");
        return;
      }
      let targetNodeText = await vscodeApi.$showInputBox({
        placeHolder: "请输入目标节点的Text值，建议自己写一个，如 abcdefg",
      });
      let anchNodeMatch = parseAttributes(content);

      const parser = xml2js.Parser({ explicitArray: true });
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
      debugger;
      fs.readFile(url.path, function (err, data) {
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
            targetNodeText
          );
          console.log("result===", result);
          if (result) {
            let { commonParentInfo, targetNode } = result;
            // console.log(err, "=====", res.map);
            // recursion(res.map.node);
            let { anchStep, targetChildIndexArr } = commonParentInfo;
            targetChildIndexArr.push(targetNode.childIndex);
            let targetStr = "";
            let getParentStr = "";
            let getChildrenStr = "";
            for (let index = 0; index < anchStep; index++) {
              getParentStr += ".getParent()";
            }
            for (let index = 0; index < targetChildIndexArr.length; index++) {
              const childIndex = targetChildIndexArr[index];
              getChildrenStr += `.getChildren(${childIndex})`;
            }
            targetStr = `anchNode${getParentStr}${getChildrenStr}`;
            vscodeApi.$toast(targetStr);
          }
          // console.log(result.anchorNode.parents.length);
          // console.log(result.targetNode.parents.length);
        });
      });
    } catch (error) {
      vscodeApi.$toast().err(error.message);
    }
  },
};
