import { areHookInputsEqual } from "../utilities/areHookInputsEqual";
import type { AsyncReturnType } from "./utils";

export const RESOURCE_PENDING = 0;
export const RESOURCE_RESOLVED = 1;
export const RESOURCE_REJECTED = 2;
type ResourceStatus =
  | typeof RESOURCE_PENDING
  | typeof RESOURCE_RESOLVED
  | typeof RESOURCE_REJECTED
  | undefined;

export type Resource<
  T extends (...args: any) => any = (...args: any) => any
> = {
  read(): AsyncReturnType<T> | undefined;
  preload(): void;
  status: ResourceStatus;
  isLoading: boolean;
  value: AsyncReturnType<T> | undefined;
  promise:
    | (T extends Promise<any>
        ? T
        : T extends (...args: any) => Promise<infer U>
        ? Promise<U>
        : undefined)
    | undefined;
  error: Error | undefined;
};

export interface UseResourceResponse<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | undefined;
}

export interface Options {
  isPreloadAfterCallRefetch?: boolean;
  /**
   * Set false to prevents fetching in the first step, just fetch after deps be
   * changed, or refetch called.
   *
   * Default is true.
   */
  startFetchAtFirstRender?: boolean;
  /**
   * If it is true, during api reFetching, data will keep previous data until
   * refetch ended and new data assign
   *
   * Default is false
   */
  keepDataAliveWhenFetching?: boolean;
}

export interface UseCreateResourceResponse<T extends (...args: any) => any> {
  resource: Resource<T>;
  refetch: (...args: Parameters<T>) => void;
}
