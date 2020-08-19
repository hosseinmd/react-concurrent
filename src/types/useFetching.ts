import { UseResourceResponse } from "./resource";

export type UseFetching = {
  <DATA>(fetchFunc: () => Promise<DATA>): UseResourceResponse<DATA>;
  <DATA, PARAM>(
    fetchFunc: (param: PARAM) => Promise<DATA>,
    param: PARAM,
  ): UseResourceResponse<DATA>;
  <DATA, PARAM1, PARAM2>(
    fetchFunc: (param1: PARAM1, param2: PARAM2) => Promise<DATA>,
    param1: PARAM1,
    param2: PARAM2,
  ): UseResourceResponse<DATA>;
  <DATA, PARAM>(
    fetchFunc: (...params: PARAM[]) => Promise<DATA>,
    ...params: PARAM[]
  ): UseResourceResponse<DATA>;
};
