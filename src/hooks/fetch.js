//@ts-check
import { useRef, useCallback, useState } from "react";
import {
  createResource,
  RESOURCE_PENDING,
  RESOURCE_REJECTED,
} from "../resource";
import { useResource } from "./resource";
import { isEqual } from "lodash-es";

/**
 * @template T
 * @typedef {import("../resource").Resource<T>} Resource
 */

/**
 * @template T
 * @typedef {object} FetchResponse
 * @property {Resource<T>} resource
 * @property {() => void} refetch
 */

/**
 * For fetching related to state
 *
 * @example
 *   const [resource, refetch] = useFetch(fetchApi, accountID, amount);
 *
 * @template T , V
 * @param {(...arg: V[]) => Promise<T>} fetchFunc
 * @param {V[]} arg
 * @returns {FetchResponse<T>}
 */
function useFetch(fetchFunc, ...arg) {
  const [, forceUpdate] = useState({});

  const argRef = useRef([]);
  const resourceRef = useRef(null);
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
 *   const [resource, refetch] = useFetchCallback(settlementRequest);
 *
 *   function onPress() {
 *     refetch({ id: 20 });
 *   }
 *
 * @template T , V
 * @param {(...param: V[]) => Promise<T>} fetchFunc
 * @returns {FetchResponse<T>}
 */
function useFetchCallback(fetchFunc) {
  const [resource, setResource] = useState(
    createResource(async () => undefined),
  );

  const refetch = useCallback(
    (...arg) => {
      const newResource = createResource(() => fetchFunc(...arg));
      newResource.preload();
      setResource(newResource);
    },
    [fetchFunc],
  );

  return { resource, refetch };
}

/**
 * @template T , V
 * @param {(...arg: V[]) => Promise<T>} fetchFunc
 * @param {V[]} arg
 * @returns {ReturnType<useResource>}
 */
function useFetching(fetchFunc, ...arg) {
  const { resource } = useFetch(fetchFunc, ...arg);
  return useResource(resource);
}

function useFetchInfinite(fetchFunc, { limit = 30 } = {}) {
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
