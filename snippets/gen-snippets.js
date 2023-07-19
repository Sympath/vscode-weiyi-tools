const nodeApi = require('../utils/node-api');
const utils = require('../utils/index');
const path = require('path');
const regeData = require('./rege-data');


function gen(desc, trigger, body) {
  let code =
  {
    "prefix": `${trigger}`,
    "body": [
      `${body}`
    ],
    "description": `${desc}`
  }
  return code
}

// function genArr(arr) {
// }

let kindMap = {
  number: {
    kindName: '数字'
  },
  string: {
    kindName: '字符串'
  },
  general: {
    kindName: '通用'
  }
}
let result = {}
utils.eachObj(regeData, (kind, reges) => {
  let { kindName } = kindMap[kind]
  reges.forEach(snippets => {
    let [
      desc, body
    ] = snippets
    let trigger = `rege-${kind}-${desc}`
    result[desc] = gen(`${kindName}：${desc}`, trigger, body)
  })
})
nodeApi.writeFileRecursive(path.resolve(__dirname, './js-snippets.json'), JSON.stringify(result))

// trigger规则：rege-[类别]-[描述]
// genArr([
//   ['数字', 'rege-数字', '^[0-9]*$'],
//   ['n位的数字', 'rege-n位的数字', '^\\d{n}$'],

// ])
