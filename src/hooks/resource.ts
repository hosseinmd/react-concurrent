import { useState, useLayoutEffect } from "react";
import {
  UseResourceResponse,
  Resource,
  RESOURCE_RESOLVED,
  RESOURCE_REJECTED,
  RESOURCE_PENDING,
} from "../types";
import { AsyncReturnType } from "../types/utils";

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

export { useResource, useResources };
