import { Resource } from "./resource";

interface FetchCallbackResponse<T extends (...args: any) => any> {
  resource: Resource<T>;
  refetch: (...args: Parameters<T>) => void;
  /**
   * @deprecated Resolve Clear with condition in your fetch api this function
   *     will be remove
   */
  clear: () => void;
}

export type UseFetchCallback = <T extends (...args: any) => any>(
  fetchFunc: T,
) => FetchCallbackResponse<T>;
