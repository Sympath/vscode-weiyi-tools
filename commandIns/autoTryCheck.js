let name = "autoTryCheck";
const axios = require("axios");
const vscode = require("vscode");
const VscodeApi = require("../utils/vscode-api");
let vscodeApi = new VscodeApi(name);

async function fetchAPIWithLoading(apiUrl) {
  return vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: 'Fetching API Data...',
    cancellable: false
  }, async (progress, token) => {
    try {

      const response = await axios.get(apiUrl);

      if (response.status === 200) {
        const responseData = response.data;
        return responseData;
      } else {
        vscodeApi.$log(apiUrl + ' 请求失败：' + response.status);
      }
    } catch (error) {
      vscodeApi.$log(apiUrl + ' 请求发生错误：' + error.message);
    }
  });
}

module.exports = {
  name,
  implementation: async function () {
    try {
      let storeID = await vscodeApi.$showInputBox({
        placeHolder:
          "请输入店铺ID",
      });

      const storeDetailApiUrl = `https://api.dev.rp.al-array.com/1.0/stores/${storeID}?deviceId=xxx`; // 替换成实际的 API URL
      const storesApiUrl = `https://api.dev.rp.al-array.com/1.0/stores?deviceId=string&country=string&countrySource=SETTING&language=string&appVersionCode=string&limit=0&offset=4000`; // 替换成实际的 API URL

      const responseData = await fetchAPIWithLoading(storeDetailApiUrl);
      // 在 VSCode 中显示返回结果
      vscodeApi.$log(responseData)
      const couponCount = responseData.store.couponCount;
      vscodeApi.$log(`coupon数量 === ${responseData.store.couponCount}`)
      const storesResponse = await fetchAPIWithLoading(storesApiUrl);
      const hasStore = storesResponse.stores.some(s => s.storeId === storeID)
      vscodeApi.$log(`是否在store列表中 === ${hasStore}`)
      vscodeApi.$log(`store列表 === ${JSON.stringify(storesResponse.stores)}`)
      // 检查店铺是否属于有效店铺 符合coupon数量>0且在store列表中才会弹窗
      if (couponCount > 0 && hasStore) {
        vscodeApi.$toast('此店铺属于有效店铺(coupon数量>0且在store列表)')
      } else {
        if (!hasStore) {
          vscodeApi.$toast().err('此店铺属于无效店铺 不在店铺列表中')
        }
        if (couponCount <= 0) {
          vscodeApi.$toast().err('此店铺属于无效店铺 有效coupon数量为' + couponCount)
        }
      }
    } catch (error) {
      vscodeApi.$toast().err("执行失败 错误原因见OUTPUT面板日志");
      vscodeApi.$log(error.message || error.stderr);
    }

  },
};
