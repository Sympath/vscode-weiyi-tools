import request from "umi-request";

const requestData = (params: any) => {
  return request
    .get("/api/$keyword$/list", { params })
    .then((res) => ({ success: true, data: res.data, total: res.total }))
    .catch(() => ({ success: false, data: {} }));
};

export const searchApi = async (params: any) => {
  const { success, data } = await requestData(params);
  if (success) {
    return {
      data: data,
      total: data.length,
    };
  } else {
    // 必须返回 data 和 total
    return {
      data: [],
      total: 0,
    };
  }
};
