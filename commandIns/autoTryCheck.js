let name = "autoTryCheck";
const axios = require("axios");
const vscode = require("vscode");
const VscodeApi = require("../utils/vscode-api");
const { eachObj } = require("../utils");
let vscodeApi = new VscodeApi(name);

async function fetchAPIWithLoading(apiUrl) {
  return vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Fetching API Data...",
      cancellable: false,
    },
    async (progress, token) => {
      try {
        const response = await axios.get(apiUrl);

        if (response.status === 200) {
          const responseData = response.data;
          return responseData;
        } else {
          vscodeApi.$log(apiUrl + " 请求失败：" + response.status);
        }
      } catch (error) {
        vscodeApi.$log(apiUrl + " 请求发生错误：" + error.message);
      }
    }
  );
}

module.exports = {
  name,
  implementation: async function () {
    try {
      const res = [];
      const errMap = [
        {
          errMessage: "有效coupon数量为0",
          errStoreIds: [],
        },
        {
          errMessage: "不为AUTO_TRY",
          errStoreIds: [],
        },
        {
          errMessage: "不在店铺列表中 status !== ONLINE",
          errStoreIds: [],
        },
      ];
      const [
        { errStoreIds: couponCountErrStoreIds },
        { errStoreIds: autoTryErrStoreIds },
        { errStoreIds: storeListErrStoreIds },
      ] = errMap;
      const storeIDsInput = await vscodeApi.$showInputBox({
        placeHolder: "请输入店铺ID（以空格分隔）",
      });

      const storeIDs = storeIDsInput.split(" ");
      // let successCount = 0; // 计数成功处理的店铺ID
      // let allProcessed = true; // 是否所有店铺ID都已处理

      let platform = await vscodeApi.$quickPick(["web", "app"], {
        placeHolder: "请输入平台",
      });
      vscodeApi.$log(`AutoTry====平台 === ${platform} 👌`);
      for (const storeID of storeIDs) {
        let errMessage = "";
        let flag = platform === "web" ? "autoTryOnWeb" : "autoTryOnApp";

        const storeDetailApiUrl = `https://api.dev.rp.al-array.com/1.0/stores/${storeID}?deviceId=345848d5-04ae-4844-8c2f-67d3035491b9&country=US&countrySource=SIM&language=en_us&appVersionCode=100800001&partner=tmobile`; // 替换成实际的 API URL
        vscodeApi.$log(`请求的接口地址 ${storeDetailApiUrl}`);
        try {
          const responseData = await fetchAPIWithLoading(storeDetailApiUrl);
          if (!responseData) {
            throw new Error("responseData为空");
          }
          const storeInfo = responseData.store;
          vscodeApi.$log(`Store ID: ${storeID} ===== `);
          vscodeApi.$log(storeInfo);

          const couponCount = storeInfo.couponCount;
          const status = storeInfo.status;
          vscodeApi.$log(`coupon数量 === ${couponCount}`);
          vscodeApi.$log(`status === ${status}`);

          vscodeApi.$log(`是否在store列表中`);
          vscodeApi.$log(status === "ONLINE");

          if (
            couponCount > 0 &&
            storeInfo[flag] === "AUTO_TRY" &&
            status === "ONLINE"
          ) {
            // successCount++; // 增加成功处理的计数
          } else {
            if (status !== "ONLINE") {
              storeListErrStoreIds.push(storeID);
              errMessage = "不在店铺列表中";
            } else if (storeInfo[flag] !== "AUTO_TRY") {
              autoTryErrStoreIds.push(storeID);
              errMessage = `${flag}不为AUTO_TRY`;
            } else if (couponCount <= 0) {
              couponCountErrStoreIds.push(storeID);
              errMessage = "有效coupon数量为" + couponCount;
            } else {
              errMessage = "未知失败原因";
            }
            // allProcessed = false; // 如果有任何一个店铺处理失败，则设置为false
          }
        } catch (error) {
          errMessage = error;
        }

        if (errMessage) {
          vscodeApi.$log(`店铺ID ${storeID} 处理失败: ${errMessage}`);
          res.push(`店铺ID ${storeID} 处理失败: ${errMessage}`);
        } else {
          vscodeApi.$log(
            `此店铺属于有效店铺(coupon数量>0 在store列表且${platform}端${flag}为AUTO_TRY)`
          );
          res.push(
            `此店铺属于有效店铺(coupon数量>0 在store列表且${platform}端${flag}为AUTO_TRY)`
          );
        }
      }

      // if (storeIDs.length === 1) {
      //   if (successCount === 1) {
      //     vscodeApi.$toast().info(`店铺ID ${storeIDs[0]} 处理成功`);
      //   } else {
      //     vscodeApi.$toast().err(`店铺ID ${storeIDs[0]} 处理失败`);
      //   }
      // } else {
      //   if (allProcessed && successCount === storeIDs.length) {
      //     vscodeApi.$toast().info("所有店铺ID均处理成功");
      //   } else {
      //     vscodeApi.$toast().err("处理完成，请查看 OUTPUT 面板获取详细信息");
      //   }
      // }
      vscodeApi.$toast("所有店铺ID均处理成功 结果请看OUTPUT面板");

      vscodeApi.$log("===== 店铺详情可见上方输出内容 ======");
      vscodeApi.$log(res);
      vscodeApi.$log("===== 飞书同步问题 =====");
      errMap.forEach(({ errMessage, errStoreIds }) => {
        if (errStoreIds.length > 0) {
          vscodeApi.$log(`
问题现象：${errMessage}
平台：${platform}
店铺id：
${JSON.stringify(errStoreIds, null, 4)}
   `);
        }
      });
      vscodeApi.$log("===== 小知识 ======");
      // 执行一次特定逻辑
      if (storeIDs.length > 0) {
        vscodeApi.$log(`如果店铺状态正常但仍无日志打印，请尝试如下动作`);
        vscodeApi.$log(
          `1. 进入reward+ - current is enable点击切换进入关闭状态`
        );
        vscodeApi.$log(
          `2. 关闭accessible（点击小礼物图标，无coupons数量数字那个）`
        );
        vscodeApi.$log(`3.  连接服务 `);
        vscodeApi.$log(`4. 开启accessible（顶部的turn on）`);
      }
    } catch (error) {
      vscodeApi.$toast().err("执行失败 错误原因见 OUTPUT 面板日志");
      vscodeApi.$log(error.message || error.stderr);
    }
  },
};
