import { useRef, useCallback, useState } from "react";
import { createResource } from "../resource";
import { useResource } from "./resource";
import { isEqual } from "lodash-es";
import {
  UseResourceResponse,
  Resource,
  UseFetchCallback,
  FetchCallbackResponseArray,
  RESOURCE_PENDING,
  RESOURCE_REJECTED,
  UseFetchingCallback,
  FetchingCallbackResponseArray,
  UseFetching,
} from "../types";

interface FetchResponse<T> {
  resource: Resource<T>;
  refetch: () => void;
}

/**
 * For fetching related to state
 *
 * @example
 *   const { resource, refetch } = useFetch(fetchApi, accountID, amount);
 */

function useFetch<T, V>(
  fetchFunc: (...arg: V[]) => Promise<T>,
  ...arg: V[]
): FetchResponse<T> {
  const [, forceUpdate] = useState({});

  const argRef = useRef<V[]>([]);
  const resourceRef = useRef<Resource<any> | null>(null);
  const isArgChanged = isEqual(argRef.current, arg);

  if (!isArgChanged || resourceRef.current === null) {
    argRef.current = arg;
    resourceRef.current = createResource(() => fetchFunc(...arg));
    resourceRef.current.preload();
  }

  const refetch = useCallback(() => {
    resourceRef.current = null;
    forceUpdate({});
  }, []);

  return { resource: resourceRef.current, refetch };
}

/**
 * For call fetching any time you want
 *
 * @example
 *   function settlementRequest() {
 *     // any async function
 *     return fetch("url").then((res) => res.toJson());
 *   }
 *
 *   const { resource, refetch } = useFetchCallback(settlementRequest);
 *
 *   function onPress() {
 *     refetch({ id: 20 });
 *   }
 */
const useFetchCallback: UseFetchCallback = <T, V>(
  fetchFunc: (...param: V[]) => Promise<T>,
): FetchCallbackResponseArray<T, V> => {
  const fetchRef = useRef(fetchFunc);

  if (fetchRef.current !== fetchFunc) {
    fetchRef.current = fetchFunc;
  }
  const [resource, setResource] = useState(() =>
    createResource<any>(async () => undefined),
  );

  const refetch = useCallback((...arg) => {
    const newResource = createResource(() => fetchRef.current(...arg));
    newResource.preload();
    setResource(newResource);
  }, []);

  const clear = useCallback(() => {
    const newResource = createResource((): any => undefined);
    newResource.preload();
    setResource(newResource);
  }, []);

  return { resource, refetch, clear };
};

const useFetchingCallback: UseFetchingCallback = <T, V>(
  fetchFunc: (...param: V[]) => Promise<T>,
): FetchingCallbackResponseArray<T, V> => {
  const { resource, refetch } = useFetchCallback(fetchFunc);
  const { data, error, isLoading } = useResource(resource);
  return { data, error, isLoading, refetch };
};

const useFetching: UseFetching = <T, V>(
  fetchFunc: (...arg: V[]) => Promise<T>,
  ...arg: V[]
): UseResourceResponse<T> & { refetch: any } => {
  const { resource, refetch } = useFetch(fetchFunc, ...arg);
  return { ...useResource(resource), refetch };
};

function useFetchInfinite(
  fetchFunc: (arg: any) => Promise<any[]>,
  { limit = 30 } = {},
) {
  const skipRef = useRef(0);
  const [resources, setResource] = useState(() => {
    const source = createResource(() => fetchFunc({ limit, skip: 0 }));
    source.preload();

    return [source];
  });

  const fetchMore = useCallback(() => {
    if (resources[resources.length - 1].status === RESOURCE_PENDING) {
      return;
    }

    if (resources[resources.length - 1].status === RESOURCE_REJECTED) {
      resources[resources.length - 1] = createResource(() =>
        fetchFunc({ limit, skip: skipRef.current }),
      );
      resources[resources.length - 1].preload();
      setResource((sources) => [...sources]);

      return;
    }
    //@ts-ignore
    if (resources[resources.length - 1].value?.length <= 0) {
      return;
    }

    skipRef.current += limit;
    const newResource = createResource(() =>
      fetchFunc({ limit, skip: skipRef.current }),
    );
    newResource.preload();
    setResource((sources) => [...sources, newResource]);
  }, [fetchFunc, limit, resources]);

  const unstable_refresh = useCallback(() => {
    setResource((sources) => [...sources]);
  }, []);

  return { resources, fetchMore, unstable_refresh };
}

export {
  useFetchInfinite,
  useFetch,
  useFetching,
  useFetchCallback,
  useFetchingCallback,
};
