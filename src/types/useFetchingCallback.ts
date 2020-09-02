import { UseResourceResponse } from "./resource";
import { AsyncReturnType } from "./utils";

export interface FetchingCallbackResponse<T extends (...args: any) => any>
  extends UseResourceResponse<AsyncReturnType<T>> {
  refetch: (...args: Parameters<T>) => void;
}

export declare type UseFetchingCallback = <T extends (...args: any) => any>(
  fetchFunc: T,
) => FetchingCallbackResponse<T>;
