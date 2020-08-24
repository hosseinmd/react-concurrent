import { UseResourceResponse } from "./resource";

type UseFetchingResponse<DATA> = UseResourceResponse<DATA> & {
  refetch: () => void;
};

export type UseFetching = {
  <DATA>(fetchFunc: () => Promise<DATA>): UseFetchingResponse<DATA>;
  <DATA, PARAM>(
    fetchFunc: (param: PARAM) => Promise<DATA>,
    param: PARAM,
  ): UseFetchingResponse<DATA>;
  <DATA, PARAM1, PARAM2>(
    fetchFunc: (param1: PARAM1, param2: PARAM2) => Promise<DATA>,
    param1: PARAM1,
    param2: PARAM2,
  ): UseFetchingResponse<DATA>;
  <DATA, PARAM>(
    fetchFunc: (...params: PARAM[]) => Promise<DATA>,
    ...params: PARAM[]
  ): UseFetchingResponse<DATA>;
};
