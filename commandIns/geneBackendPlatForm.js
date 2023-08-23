let name = "geneBackendPlatForm";
const VscodeApi = require("../utils/vscode-api");
const { promisify } = require('util');
const fs = require('fs');
const nodeApi = require("../utils/node-api");
let vscodeApi = new VscodeApi(name);
const path = require('path')
const fsExtra = require('fs-extra');
const { eachObj } = require("../utils");

function generateConfigAndMockData(attributeList, searchFormPropertiesStr = '') {
  const attributes = attributeList.split(' ');
  const searchFormAttributes = searchFormPropertiesStr.split(' ');
  const AddSchema = {};
  const columns = [];
  const mockData = [];
  const searchForm = [];

  attributes.forEach((attribute, index) => {
    const fieldName = attribute;
    const fieldTitle = attribute.charAt(0).toUpperCase() + attribute.slice(1);

    AddSchema[fieldName] = {
      title: fieldTitle,
      type: 'string',
      widget: 'input',
      required: true
    };

    columns.push({
      title: fieldTitle,
      dataIndex: fieldName,
      key: fieldName,
      valueType: 'text',
      required: true
    });

    mockData.push({
      id: index + 1,
      [fieldName]: `Example ${fieldTitle} ${index + 1}`,
      createdAt: `2023-08-21T10:00:00Z`,
      updatedAt: `2023-08-21T12:30:00Z`,
      creator: `Creator ${index + 1}`,
      updater: `Updater ${index + 1}`
    });
  });
  searchFormAttributes.forEach((attribute) => {
    const fieldName = attribute;
    if (!attribute) {
      return
    }
    searchForm[fieldName] = {
      title: fieldName,
      key: fieldName,
      type: 'string',
    };
  });

  return {
    AddSchema: JSON.stringify(AddSchema),
    columns: JSON.stringify(columns),
    mockData: JSON.stringify(mockData),
    searchForm: JSON.stringify(searchForm)
  };
}
async function getAllSubdirectories(directoryPath) {
  try {
    return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, { withFileTypes: true }, (err, files) => {
      if (err) {
        reject(err);
      } else {
        const subdirectories = files
        .filter(file => file.isDirectory())
        .map(file => file.name);

      resolve(subdirectories)
      }
    });
  });
  } catch (err) {
    throw err;
  }
}
// 读取指定路径文件并返回文件内容字符串
function readFileContent(filePath) {
  // 将 fs.readFile 方法转换成 Promise 形式
  const readFilePromise = promisify(fs.readFile);
  return readFilePromise(filePath, 'utf8');
}

// 获取模版文件 - 替换关键词 - 写入模版文件
async function genTargetFile(tamplatePath, keyword, content) {
  const templateStr = await readFileContent(tamplatePath)
  const handledTemplateStr = templateStr.replace(keyword, content)
        await nodeApi.writeFileRecursive(
          tamplatePath,
          handledTemplateStr
        );
}
/**
 * 关键词
 * 1. $ActionSchema$
 * 2. $keyword$
 * 3. $columns$
 * 4. $searchForm$
 */
module.exports = {
    name,
    implementation: async function (url) {
      try {
        let vscodeRootPath = await vscodeApi.getRelativeRootPromise();
          // 1. 获得信息：keyword / 属性列表
          let keyword = await vscodeApi.$showInputBox({
            placeHolder: '请输入keyword',
          })
        const targetFloderPath = `${url.path}/${keyword}Management`
        const mockFilePath = vscodeRootPath + '/mock/' + keyword + '.js'
          vscodeApi.$log(`AutoTry====keyword === ${keyword} 👌`)
          let propertiesStr = await vscodeApi.$showInputBox({
            placeHolder: '请输入属性列表 以空格分割',
          })
          vscodeApi.$log(`AutoTry====propertiesStr === ${propertiesStr} 👌`)
          await nodeApi.doShellCmd(`mkdir ${targetFloderPath}`)
          // 1. 复制移动模版仓库 
          const templateReposPath = path.join(__dirname, 'applovin/backend-platform/pageModel');
          const mockTemplateFilePath = path.join(__dirname, `applovin/backend-platform/pageModel/mock.js`);
          const subdirectories = await getAllSubdirectories(templateReposPath)
          const modelType = await vscodeApi.$quickPick(subdirectories)
          if (modelType === 'searchForm') {
            let searchFormPropertiesStr = await vscodeApi.$showInputBox({
              placeHolder: '请输入搜索表单属性列表 以空格分割',
            })
            vscodeApi.$log(`AutoTry====searchFormPropertiesStr === ${searchFormPropertiesStr} 👌`)
          }
          const templateRepoPath = `${templateReposPath}/${modelType}`
          fsExtra.copySync(templateRepoPath, targetFloderPath);
          await nodeApi.doShellCmd(`cp ${mockTemplateFilePath} ${mockFilePath}`)
          // 2. 生成数据
          const { AddSchema, mockData, columns, searchForm } = generateConfigAndMockData(propertiesStr, searchFormPropertiesStr);
          // 3. 处理模版问题
          // request 中替换keyword
          // table-schema 中替换columns searchForm
        let map = {
          'request.tsx': {
            keyword
          },
          'table-schema.tsx': {
            columns,
            searchForm
          },
          'form-schema.tsx': {
            AddSchema
          }
        }
        eachObj(map, (fileName, _) => {
          const filePath = `${targetFloderPath}/${fileName}`
          eachObj(async (keyword, value) => { 
            if (value) {
              await genTargetFile(filePath,`$${keyword}$`, value)
            }
          })
        })
        const routeCode = `{
        path: '/${keyword}',
        name: '${keyword}',
        icon: 'api', // 对应的图标名称
        component: '@${targetFloderPath.split('src')[1]}',
      },`;
      // vscodeApi.clipboardWriteText(`gac "feat: ${storeFolderName}脚本完成" && gp`)
      vscodeApi.clipboardWriteText(routeCode)
        await genTargetFile(mockFilePath, '$mock$', mockData)
        vscodeApi.$log(`routeCode == ${routeCode}`)
        vscodeApi.$toast('模版生成成功✅✅✅ 路由定义已生成至剪切板 可直接粘贴执行')
        } catch (error) {
            vscodeApi.$toast(`操作失败，失败原因为：${error.stderr || error.message}`)
        }
    },
};
