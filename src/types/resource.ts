export const RESOURCE_PENDING = 0;
export const RESOURCE_RESOLVED = 1;
export const RESOURCE_REJECTED = 2;

type ResourceStatus =
  | typeof RESOURCE_PENDING
  | typeof RESOURCE_RESOLVED
  | typeof RESOURCE_REJECTED
  | undefined;

export type Resource<V> = {
  read(): V | undefined;
  preload(): void;
  status: ResourceStatus;
  value: Promise<V | void> | V | void;
};

export interface UseResourceResponse<T> {
  data: T;
  isLoading: boolean;
  error: Error;
}
