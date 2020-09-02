import { UseResourceResponse } from "./resource";
import { ThenArg } from "./utils";

export interface FetchingCallbackResponse<T extends (...args: any) => any>
  extends UseResourceResponse<ThenArg<T>> {
  refetch: (...args: Parameters<T>) => void;
}

export declare type UseFetchingCallback = <T extends (...args: any) => any>(
  fetchFunc: T,
) => FetchingCallbackResponse<T>;
