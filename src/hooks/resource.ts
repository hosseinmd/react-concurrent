import {
  useState,
  useLayoutEffect,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  UseResourceResponse,
  Resource,
  RESOURCE_RESOLVED,
  RESOURCE_PENDING,
  Options,
  UseCreateResourceResponse,
} from "../types";
import { AsyncReturnType } from "../types/utils";
import { createResource } from "../resource";
import { areHookInputsEqual } from "../utilities/areHookInputsEqual";

export type UseResourceOptions = {
  /**
   * Adds a delay to loading so that loading is not shown if the api is fetched sooner
   *
   * If you set it 1000 ms, loading not showing until 1000 ms
   */
  loadingStartDelay?: number;
};
/**
 * This function allow to use resource without React.Suspense.
 *
 * @example
 *   const { data = [], isLoading, error } = useResource(resource);
 */
function useResource<V extends (...args: any) => any>(
  resource: Resource<V>,
  { loadingStartDelay }: UseResourceOptions = {},
): UseResourceResponse<AsyncReturnType<V>> {
  const [, forceUpdate] = useState({});

  resource.preload();

  const data = resource.value;
  const error = resource.error;

  useLayoutEffect(() => {
    let destructed = false;

    const update = () => !destructed && forceUpdate({});

    _listenerToResource(resource, { data, error }, update);

    return () => {
      destructed = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  const isLoadingRef = useRef(false);

  useEffect(() => {
    if (!resource.isLoading || !loadingStartDelay) {
      return;
    }

    let timeout: null | NodeJS.Timeout = setTimeout(() => {
      isLoadingRef.current = true;
      forceUpdate({});
      timeout = null;
    }, loadingStartDelay);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      } else {
        isLoadingRef.current = false;
      }
    };
  }, [resource.isLoading, loadingStartDelay]);

  return {
    data,
    isLoading:
      loadingStartDelay && resource.isLoading
        ? isLoadingRef.current
        : resource.isLoading,
    error,
  };
}

function _listenerToResource<T extends Resource<() => any>>(
  resource: T,
  resolved: { data: any; error: any },
  callback: () => void,
) {
  if (
    resource.status === RESOURCE_RESOLVED &&
    resolved.data !== resource.value
  ) {
    callback();
  } else if (resource.status === RESOURCE_PENDING) {
    resource.promise?.then(callback);
  }
}

const emptyResource = createResource(() => undefined);

/**
 * A hook for creating resource without preloading
 *
 * @example
 *   const { resource, refetch } = useCreateResource(fetchApi, accountID, amount);
 *   resource.preload(); // if you need to preload data call this
 *
 * @param fetchFunc Promise returned function
 * @param arg This is fetchFunc arguments, if arguments changed function give
 *     another resource
 */
const useCreateResource = <T extends (...args: any) => any>(
  fetchFunc: T,
  /** Default is [] */
  deps: any[] = [],
  {
    isPreloadAfterCallRefetch = true,
    startFetchAtFirstRender = true,
    keepDataAliveWhenFetching = false,
  }: Options = {},
): UseCreateResourceResponse<T> => {
  const [, forceUpdate] = useState({});

  const preDepsRef = useRef<any[]>(deps);
  const funcRef = useRef(fetchFunc);
  const resourceRef = useRef<Resource<T>>(emptyResource as Resource<T>);

  if (funcRef.current !== fetchFunc) {
    funcRef.current = fetchFunc;
  }

  const isArgChanged = areHookInputsEqual(deps, preDepsRef.current);

  if (!isArgChanged) {
    preDepsRef.current = deps;
  }

  if (
    !isArgChanged ||
    (resourceRef.current === emptyResource && startFetchAtFirstRender)
  ) {
    resourceRef.current = createResource<T>(
      fetchFunc,
      keepDataAliveWhenFetching ? resourceRef.current.value : undefined,
    );
  }

  const refetch = useCallback(
    (...args: any) => {
      resourceRef.current = createResource<T>(
        (() => funcRef.current(...args)) as T,
        keepDataAliveWhenFetching ? resourceRef.current.value : undefined,
      );
      isPreloadAfterCallRefetch && resourceRef.current.preload();
      forceUpdate({});
    },
    [isPreloadAfterCallRefetch, keepDataAliveWhenFetching],
  );

  return { resource: resourceRef.current, refetch };
};

export { useResource, useCreateResource };
