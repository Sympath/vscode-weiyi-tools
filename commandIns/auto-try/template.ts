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

const createActions = (
  params: {
    checkoutSuccess?: FindNodeParams;
    codeEntry?: FindNodeParams;
    codeInput?: FindNodeParams;
    applyButton?: FindNodeParams;
    applyError?: FindNodeParams;
    price?: FindNodeParams;
    removeButton?: FindNodeParams;

    applyDuration?: number;
    cashbackParams?: CashbackParams;
    checkoutUrl: RegExp;
  } = {
    checkoutSuccess: {},
    // 脚本处理2
    codeEntry: "codeEntry-ReplaceHolder",
    // 脚本处理2
    codeInput: "codeInput-ReplaceHolder",
    // 脚本处理3
    applyButton: "applyButton-ReplaceHolder",
    // 脚本处理4
    price: "price-ReplaceHolder",
    // 脚本处理5 w-todo 因无匹配成功优惠券 无法获取删除优惠券节点
    removeButton: {
      text: "Remove填充文案 不写属性会堵塞运行",
    },
    applyDuration: 0,
    // 脚本处理1
    checkoutUrl: /americangolf\.co\.uk\/shopping-cart/,
  }
) => {
  const getCodeEntry = async () => {
    return await findNodeAsync(params.codeEntry!);
  };
  async function getCodeInput() {
    const anchNode = await findNodeAsync(params.codeInput);
    return anchNode?.getChild(0);
  }

  const getApplyButton = async () => {
    const anchNode = await findNodeAsync(params.codeInput);
    return anchNode?.getChild(1);
  };
  // 脚本处理4
  const getPrice = async () => {
    const child = await findNodeAsync(params.price);
    const regex = /[^\d£$.]+/g;
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
    // 先处理下删除优惠券的动作
    const removeButton = await getRemoveButton();
    removeButton && clickNode(removeButton, { duration: params.applyDuration });
    removeButton && clickNode(removeButton, { duration: params.applyDuration });
    removeButton && clickNode(removeButton, { duration: params.applyDuration });
    // ...
    info("start getCodeInput ======");
    const codeInput = await getCodeInput();
    info(`after getCodeInput ====== ${codeInput}`);
    if (!codeInput) {
      info("click Entry ====== getCodeInput");
      clickNode(await getCodeEntry());
      codeInput = getCodeInput();
    }

    if (!codeInput) return ApplyError.NODE_NOT_FOUND;

    updateText(await codeInput, code);

    const applyButton = getApplyButton();
    info(`6 applyButton ======== ${applyButton}`);
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
      const codeInput = await getCodeInput();
      info(`5 codeInput========= ${codeInput}`);
      const codeEntry = await getCodeEntry();
      info(`6 codeEntry========= ${codeEntry}`);
      if (isCheckout && (codeEntry || codeInput)) {
        info("=====================================================");
        showAutoTryPopup();
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
