import { useCreateResource, useResource, UseResourceOptions } from "./resource";
import {
  UseResourceResponse,
  AsyncReturnType,
  UseCreateResourceResponse,
  Options,
} from "../types";

export type UseFetchingCallback = <T extends (...args: any) => any>(
  fetchFunc: T,
  options?: UseResourceOptions,
) => UseResourceResponse<AsyncReturnType<T>> & {
  refetch: UseCreateResourceResponse<T>["refetch"];
};

/**
 * For fetching data after invoke refetch
 *
 * @example
 *   const { data, refetch } = useFetching(() => fetchApi());
 *
 *   return <Button onClick={refetch} />;
 */
const useFetchingCallback: UseFetchingCallback = (fetchFunc, options) => {
  const { resource, refetch } = useCreateResource(fetchFunc, [], {
    startFetchAtFirstRender: false,
  });
  const { data, error, isLoading } = useResource(resource, options);

  return { data, error, isLoading, refetch };
};

export type UseFetching = <T extends (...args: any) => any>(
  fetchFunc: T,
  deps?: any[],
  options?: Options & UseResourceOptions,
) => UseResourceResponse<AsyncReturnType<T>> & {
  refetch: UseCreateResourceResponse<T>["refetch"];
};

/**
 * For fetching data based on state change
 *
 * @example
 *   const [amount] = useState(100);
 *   const { data, isLoading } = useFetching(() => fetchApi(amount), [amount]);
 */
const useFetching: UseFetching = (fetchFunc, deps, options) => {
  const { resource, refetch } = useCreateResource(fetchFunc, deps, options);
  const { data, error, isLoading } = useResource<any>(resource, {
    loadingStartdelay: options?.loadingStartdelay,
  });

  return { data, error, isLoading, refetch };
};

export { useFetching, useFetchingCallback };
