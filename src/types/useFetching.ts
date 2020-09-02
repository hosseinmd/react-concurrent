import { UseResourceResponse } from "./resource";
import { AsyncReturnType } from "./utils";

type UseFetchingResponse<DATA> = UseResourceResponse<DATA> & {
  refetch: () => void;
};

export type UseFetching = <T extends (...args: any) => any>(
  fetchFunc: T,
  ...args: Parameters<T>[]
) => UseFetchingResponse<AsyncReturnType<T>>;
