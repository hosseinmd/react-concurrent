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

export type Resource<T extends (...args: any) => any> = {
  read(): AsyncReturnType<T> | undefined;
  preload(): void;
  status: ResourceStatus;
  isLoading: boolean;
  value: AsyncReturnType<T> | T | undefined;
};

export interface UseResourceResponse<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | undefined;
}

export type Options = {
  isEqual?: typeof areHookInputsEqual;
  isPreloadAfterCallRefetch?: boolean;
  startFetchAtFirstRender?: boolean;
};

export interface UseCreateResourceResponse<T extends (...args: any) => any> {
  resource: Resource<T>;
  refetch: (...args: Parameters<T>) => void;
}

export type UseCreateResource = <T extends (...args: any) => any>(
  fetchFunc: T,
  deps?: any[],
  options?: Options,
) => UseCreateResourceResponse<T>;
