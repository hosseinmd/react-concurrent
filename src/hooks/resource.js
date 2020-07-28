//@ts-check
import { useState, useLayoutEffect } from "react";
import {
  RESOURCE_RESOLVED,
  RESOURCE_REJECTED,
  RESOURCE_PENDING,
} from "../resource";

/**
 * Is a boolean. It’s React’s way of informing us whether we’re waiting.
 *
 * @typedef {boolean} IsLoading
 */

/**
 * @template T
 * @typedef {import("../resource").Resource<T>} Resource
 */

/**
 * @template T
 * @typedef {{ data: T; isLoading: IsLoading; error: Error }} ResourceResponse
 */
/**
 * @template T
 * @typedef {{ data: T[]; isLoading: IsLoading; error: Error }} ResourcesResponse
 */

/**
 * This function allow to use resource without React.Suspense.
 *
 * @example
 *   const { data = [], isLoading, error } = useResource(resource, onError);
 *
 * @template V
 * @param {Resource<V>} resource
 * @returns {ResourceResponse<V>}
 */
function useResource(resource) {
  let [, forceUpdate] = useState({});

  let { data, error, isLoading } = _destructorResource(resource);

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
 *   const [data = [], isLoading, error] = useResource(resource, onError);
 *
 * @template V
 * @param {Resource<V>[]} resources
 * @returns {ResourcesResponse<V>}
 */
function useResources(resources) {
  let [, forceUpdate] = useState({});
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

  const data = resolved.reduce((prev, { data: _data }) => {
    if (!_data) {
      return prev;
    }

    return [...prev, ..._data];
  }, []);
  const error = resolved[resolved.length - 1].error;
  const isLoading = resolved[resolved.length - 1].isLoading;

  return { data, isLoading, error };
}

function _destructorResource(source) {
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

function _listenerToResource(resource, resolved, callback) {
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
