import { AsyncReturnType } from "./utils";

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
  value: AsyncReturnType<T> | T | undefined;
};

export interface UseResourceResponse<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | undefined;
}
