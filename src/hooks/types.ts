export interface UseResourceResponse<T> {
  data: T;
  isLoading: boolean;
  error: Error;
}
