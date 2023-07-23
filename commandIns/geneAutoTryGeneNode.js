let name = "geneAutoTryGeneNode";
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);
// 目标属性处理对象
const targetNodes = [
  'codeEntry',
  'codeInput',
  'applyButton',
  'price',
  'checkoutUrl',
  'anchNode'
]
const targetNodeMap = {
  codeEntry: {
    node: null, // 源节点
    Text: null, // Text内容
    ID: null, // ID
    siblingNodes: [], // 兄弟节点数组
    equalTexts: [],// 相同Text的节点数组
    equalClassNames: [] // 相同类名的节点数组
  },
  checkoutUrl: {
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
  }
}

module.exports = {
  name,
  implementation: async function () {
    try {
      let autoNodeType = await vscodeApi.$quickPick(targetNodes, {
        placeHolder: '请选择锚点类型'
      })
      if (autoNodeType === 'anchNode') {
        let anchAutoTryNode = await vscodeApi.$quickPick(targetNodes.slice(0, 3), {
          placeHolder: '请选择锚节点对应类型'
        })
        vscodeApi.insertTextAtCursor(`anchNode="${anchAutoTryNode}"`)
      } else {
        vscodeApi.insertTextAtCursor(`AutoTryNode="${autoNodeType}"`)
        targetNodeMap[autoNodeType].handled = true
      }
    } catch (error) {
      // vscodeApi.$toast().err("执行失败 错误原因见OUTPUT面板日志");
      vscodeApi.$log(error.message);
    }

  },
};
