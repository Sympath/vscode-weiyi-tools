import { ApplyError } from "@/constant";
import {
  asyncApply,
  clickNode,
  findNodeAsync,
  getPriceFromText,
  getUrlInputNode,
  info,
  showAutoTryPopup,
  updateText,
} from "@/utils";

function noop(params?: any): any {}

const createActions = // opti-ReplaceHolder => {
  const getCodeEntry = async () => {
    return await findNodeAsync(params.codeEntry!);
  };
  async function getCodeInput() {
    const anchNode = await findNodeAsync(params.codeInput);
    return anchNode?.getChild(0);
  }

  const getApplyButton = async () => {
    return await findNodeAsync(params.applyButton);
  };
  // 脚本处理4
  const getPrice = async () => {
    const child = await findNodeAsync(params.price);
    const regex = /[^\d£$,.€]+/g;
    const amount = (child?.getText() || "").replace(regex, "");
    info(`current price====${amount}`);
    const price = getPriceFromText(amount);
    info(`current price handled====${price.value}`);
  };

  const getRemoveButton = async () => {
    const btn = await findNodeAsync(params.removeButton!);
    // const anchNode = await findNodeAsync({
    //   className: 'android.widget.ListView',
    //   text: 'Gift card or discount code'
    // })
    // return anchNode.getChild(0).getChild(1)
    return btn;
  };

  const applyCode = async (code: string) => {
    const codeInput = await getCodeInput();
    if (!codeInput) {
      clickNode(await getCodeEntry());
      codeInput = getCodeInput();
    }

    if (!codeInput) return ApplyError.NODE_NOT_FOUND;

    updateText(await codeInput, code);

    const applyButton = getApplyButton();
    if (!applyButton) return ApplyError.NODE_NOT_FOUND;

    clickNode(await applyButton, { duration: params.applyDuration });
  };

  const beforeAll = async () => {
    const removeButton = await getRemoveButton();
    removeButton && clickNode(removeButton, { duration: params.applyDuration });
  };
  const afterAll = noop;
  const onSuccess = async () => {
    info("-----onSuccess-------");
    const removeButton = await getRemoveButton();
    removeButton && clickNode(removeButton, { duration: params.applyDuration });
  };
  const onFail = noop;

  return {
    async checkAutoTry() {
      info(
        "1 checkAutoTry ------------------------------------------------------"
      );
      const urlNode = getUrlInputNode();
      // const otherUrl = /spirithalloween\.com\/checkout\/update_items_in_order/
      info(`2 urlNode   is  ======   ${urlNode?.getText()}`);
      info(`3 params.checkoutUrl  ==== ${params.checkoutUrl}`);
      // const isCheckout = (params.checkoutUrl!.test(urlNode?.getText() || '') || otherUrl!.test(urlNode?.getText() || ''))
      const isCheckout = params.checkoutUrl!.test(urlNode?.getText() || "");
      info(`4 isCheckout========= ${isCheckout}`);
      if (isCheckout) {
        const codeInput = await getCodeInput();
        info(`5 codeInput========= ${codeInput}`);
        // 遗留问题：当页面没有Entry时 部分店铺脚本会卡住无法继续向下执行 所以采用如下写法拆分处理
        if (codeInput) {
          info("=====================================================");
          showAutoTryPopup();
        } else {
          const codeEntry = await getCodeEntry();
          info(`6 codeEntry========= ${codeEntry}`);
          if (codeEntry) {
            info("=====================================================");
            showAutoTryPopup();
          }
        }
      }
    },
    startAutoTry() {
      asyncApply(
        { applyCode, getPrice },
        { beforeAll, onSuccess, afterAll, onFail }
      );
    },
  };
};

// provide default actions
const { checkAutoTry, startAutoTry } = createActions();

export { createActions, checkAutoTry, startAutoTry };
