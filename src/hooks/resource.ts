import { useState, useLayoutEffect, useCallback, useRef } from "react";
import {
  UseResourceResponse,
  Resource,
  RESOURCE_RESOLVED,
  RESOURCE_REJECTED,
  RESOURCE_PENDING,
} from "../types";
import { AsyncReturnType } from "../types/utils";
import { isEqual } from "lodash-es";
import { createResource } from "../resource";

interface ResourcesResponse<T> {
  data: T[];
  isLoading: boolean;
  error: Error;
}

/**
 * This function allow to use resource without React.Suspense.
 *
 * @example
 *   const { data = [], isLoading, error } = useResource(resource, onError);
 */
function useResource<V extends (...args: any) => any>(
  resource: Resource<V>,
): UseResourceResponse<AsyncReturnType<V>> {
  const [, forceUpdate] = useState({});

  const { data, error, isLoading } = _destructorResource(resource);

  useLayoutEffect(() => {
    let destructed = false;

    const update = () => !destructed && forceUpdate({});

    _listenerToResource(resource, { data, error, isLoading }, update);

    return () => {
      destructed = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  return { data, isLoading, error };
}

/**
 * This function allow to use resources list without React.Suspense.
 *
 * @example
 *   const { data = [], isLoading, error } = useResource(resource, onError);
 *
 * @todo Is experimental
 */
function useResources<V extends (...args: any) => any>(
  resources: Resource<V>[],
): ResourcesResponse<AsyncReturnType<V>> {
  const [, forceUpdate] = useState({});
  const resolved = resources.map(_destructorResource);

  useLayoutEffect(() => {
    let destructed = false;

    const update = () => !destructed && forceUpdate({});

    resources.forEach((source, index) =>
      _listenerToResource(source, resolved[index], update),
    );

    return () => {
      destructed = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resources]);

  const data = resolved.reduce((prev: any[], { data: _data }) => {
    if (!_data) {
      return prev;
    }

    return [...prev, ..._data];
  }, []);
  const error = resolved[resolved.length - 1].error;
  const isLoading = resolved[resolved.length - 1].isLoading;

  return { data, isLoading, error };
}

function _destructorResource(source: Resource<any>) {
  source.preload();

  let data;
  let error;
  let isLoading;
  if (source.status === RESOURCE_RESOLVED) {
    data = source.value;
    isLoading = false;
  } else if (source.status === RESOURCE_REJECTED) {
    isLoading = false;
    error = source.value;
  } else {
    isLoading = true;
  }

  return {
    data,
    error,
    isLoading,
  };
}

function _listenerToResource(
  resource: Resource<any>,
  resolved: UseResourceResponse<any>,
  callback: () => void,
) {
  if (
    resource.status === RESOURCE_RESOLVED &&
    resolved.data !== resource.value
  ) {
    callback();
  } else if (resource.status === RESOURCE_PENDING) {
    resource.value.then(callback);
  }
}

export interface UseCreateResourceResponse<T extends (...args: any) => any> {
  resource: Resource<T>;
  refetch: () => void;
}

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
function useCreateResource<T extends (...args: any) => any>(
  fetchFunc: T,
  ...arg: Parameters<T>
): UseCreateResourceResponse<T> {
  const [, forceUpdate] = useState({});

  const argRef = useRef<any[]>([]);
  const funcRef = useRef<T>(fetchFunc);
  const resourceRef = useRef<Resource<any> | null>(null);
  const isArgChanged = isEqual(argRef.current, arg);

  if (funcRef.current !== fetchFunc) {
    funcRef.current = fetchFunc;
  }

  if (!isArgChanged || resourceRef.current === null) {
    argRef.current = arg;
    resourceRef.current = createResource(() => fetchFunc(...(arg as any)));
  }

  const refetch = useCallback((preload: boolean = true) => {
    resourceRef.current = createResource(() =>
      funcRef.current(...(argRef.current as any)),
    );
    preload && resourceRef.current.preload();
    forceUpdate({});
  }, []);

  return { resource: resourceRef.current, refetch };
}

export { useResource, useResources, useCreateResource };
