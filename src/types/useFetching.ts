import { UseResourceResponse } from "./resource";

interface FetchingResponse<DATA> extends UseResourceResponse<DATA> {
  refetch: () => void;
}

export interface FetchingResponseArray<DATA, PARAM>
  extends UseResourceResponse<DATA> {
  refetch: (...arg: PARAM[]) => void;
}

export type UseFetching = {
  <DATA>(fetchFunc: () => Promise<DATA>): FetchingResponse<DATA>;
  <DATA, PARAM>(
    fetchFunc: (param: PARAM) => Promise<DATA>,
    param: PARAM,
  ): FetchingResponse<DATA>;
  <DATA, PARAM1, PARAM2>(
    fetchFunc: (param1: PARAM1, param2: PARAM2) => Promise<DATA>,
    param1: PARAM1,
    param2: PARAM2,
  ): FetchingResponse<DATA>;
  <DATA, PARAM>(
    fetchFunc: (...params: PARAM[]) => Promise<DATA>,
    ...params: PARAM[]
  ): FetchingResponse<DATA>;
};
