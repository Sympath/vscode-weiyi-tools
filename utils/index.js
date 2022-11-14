// import URI from "urijs";
// const URI = require("urijs");
let utils = {};

/**
 * 为 url 做字符串拼接，覆盖重复的query
 * @param {String} url
 * @param {Object} query
 */
// utils.assignQuery = (url = "", query = {}) => {
//   let uri = new URI(url);
//   Object.keys(query).forEach((key) => {
//     if (uri.hasQuery(key)) uri.removeQuery(key);
//   });
//   return uri.addQuery(query).toString();
// };

/**
 * 类型判断函数 传递一个要判断的类型 会返回一个函数 传要判断的值 返回是否属于之前的类型
    "Array",
    "Object",
    "Number",
    "String",
    "Undefined",
    "Boolean",
    "Function",
    "Map",
    "Null",
    "AsyncFunction"
 * @param {*} type 是否是此类型
 * @returns
 */
function typeCheck(type) {
  return function (target) {
    return Object.prototype.toString.call(target) === `[object ${type}]`;
  };
}
/**
 * 遍历对象 直接获取key value  （不会遍历原型链  forin会）
 * @param {*} obj 被遍历对象
 * @param {*} cb 回调
 */
function eachObj(obj, cb) {
  if (typeCheck("Map")(obj)) {
    for (let [key, value] of obj) {
      cb(key, value);
    }
  } else if (typeCheck("Object")(obj)) {
    for (const [key, value] of Object.entries(obj)) {
      cb(key, value);
    }
  } else {
    console.log("请传递对象类型");
  }
};
/** 判断变量是否为函数，是则执行
 * 
 * @param {*} cb 
 * @param  {...any} params 
 * @returns 
 */
const callFn = function (cb, ...params) {
  let result = {
    done: false,
    result: null
  }
  if (typeCheck('Function')(cb)) {
    result.result = cb(...params)
    result.done = true
  }
  return result
}
module.exports = {
  typeCheck,
  eachObj,
  callFn
};
