import { useCreateResource, useResource, UseResourceOptions } from "./resource";
import { Options } from "../types";

export interface UseFetchingOptions extends Options, UseResourceOptions {}
export interface UseFetchingCallbackOptions
  extends Omit<Options, "startFetchAtFirstRender">,
    UseResourceOptions {}

/**
 * For fetching data after invoke refetch
 *
 * @example
 *   const { data, refetch } = useFetching(() => fetchApi());
 *
 *   return <Button onClick={refetch} />;
 */
const useFetchingCallback = <T extends (...args: any) => any>(
  fetchFunc: T,
  options?: UseFetchingCallbackOptions,
) => {
  const { resource, refetch } = useCreateResource<T>(fetchFunc, [], {
    ...options,
    startFetchAtFirstRender: false,
  });
  const { data, error, isLoading } = useResource(resource, options);

  return { data, error, isLoading, refetch };
};

/**
 * For fetching data based on state change
 *
 * @example
 *   const [amount] = useState(100);
 *   const { data, isLoading } = useFetching(() => fetchApi(amount), [amount]);
 */
const useFetching = <T extends (...args: any) => any>(
  fetchFunc: T,
  /** Default is [] */
  deps?: any[],
  options?: UseFetchingOptions,
) => {
  const { resource, refetch } = useCreateResource<T>(fetchFunc, deps, options);
  const { data, error, isLoading } = useResource(resource, {
    loadingStartDelay: options?.loadingStartDelay,
  });

  return { data, error, isLoading, refetch };
};

export { useFetching, useFetchingCallback };
