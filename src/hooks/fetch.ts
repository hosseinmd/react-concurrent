//@ts-check
import { useRef, useCallback, useState } from "react";
import {
  createResource,
  RESOURCE_PENDING,
  RESOURCE_REJECTED,
  Resource,
} from "../resource";
import { useResource } from "./resource";
import { isEqual } from "lodash-es";

interface FetchResponse<T> {
  resource: Resource<T>;
  refetch: () => void;
}

interface FetchCallbackResponse<T, V> {
  resource: Resource<T>;
  refetch: (...arg: V[]) => void;
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

type UseFetchCallback = {
  <T, V>(fetchFunc: (param: V) => Promise<T>): FetchCallbackResponseV<T, V>,
  <T, V1, V2>(
    fetchFunc: (v1: V1, v2: V2) => Promise<T>,
  ): FetchCallbackResponseV2<T, V1, V2>,
  <T, V>(fetchFunc: (...param: V[]) => Promise<T>): FetchCallbackResponse<T, V>,
};

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
  let isArgChanged = isEqual(argRef.current, arg);

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
): FetchCallbackResponse<T, V> => {
  const fetchRef = useRef(fetchFunc);

  if (fetchRef.current !== fetchFunc) {
    fetchRef.current = fetchFunc;
  }
  const [resource, setResource] = useState(
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

function useFetching<T, V>(
  fetchFunc: (...arg: V[]) => Promise<T>,
  ...arg: V[]
): ReturnType<typeof useResource> {
  const { resource } = useFetch(fetchFunc, ...arg);
  return useResource(resource);
}

function useFetchInfinite(fetchFunc: (arg: any) => any, { limit = 30 } = {}) {
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

    if (resources[resources.length - 1].value <= 0) {
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

export { useFetchInfinite, useFetch, useFetching, useFetchCallback };
