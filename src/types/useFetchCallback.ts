import { Resource } from "./resource";

interface FetchCallbackResponse<T> {
  resource: Resource<T>;
  refetch: () => void;
  clear: () => void;
}
export interface FetchCallbackResponseArray<T, V> {
  resource: Resource<T>;
  refetch: (...arg: V[]) => void;
  /**
   * @deprecated Resolve Clear with condition in your fetch api this function
   *     will be remove
   */
  clear: () => void;
}
interface FetchCallbackResponseV<T, V> {
  resource: Resource<T>;
  refetch: (arg: V) => void;
  clear: () => void;
}

interface FetchCallbackResponseV2<T, V1, V2> {
  resource: Resource<T>;
  refetch: (v1: V1, v2: V2) => void;
  clear: () => void;
}

export type UseFetchCallback = {
  <T>(fetchFunc: () => Promise<T>): FetchCallbackResponse<T>;
  <T, V>(fetchFunc: (param: V) => Promise<T>): FetchCallbackResponseV<T, V>;
  <T, V1, V2>(
    fetchFunc: (v1: V1, v2: V2) => Promise<T>,
  ): FetchCallbackResponseV2<T, V1, V2>;
  <T, V>(fetchFunc: (...param: V[]) => Promise<T>): FetchCallbackResponseArray<
    T,
    //@ts-ignore
    V,
  >;
};
