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
 * @typedef {boolean} isPending
 */

/**
 * @template T
 * @typedef {import("../resource").Resource<T>} Resource */

/**
 * @template T
 * @typedef {{data:T, isPending:isPending, error:Error}} ResourceResponse
 *
 */
/**
 * @template T
 * @typedef {{data:T[], isPending:isPending, error:Error}} ResourcesResponse
 *
 */

/**
 * This function allow to use resource without React.Suspense.
 *
 * @example
 *   const {data = [], isLoading, error} = useResource(resource, onError);
 *
 * @template V
 * @param {Resource<V>} resource
 * @returns {ResourceResponse<V>}
 */
function useResource(resource) {
  let [, forceUpdate] = useState({});

  let { data, error, isPending } = _destructorResource(resource);

  useLayoutEffect(() => {
    let destructed = false;

    const update = () => !destructed && forceUpdate({});

    _listenerToResource(resource, { data, error, isPending }, update);

    return () => {
      destructed = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  return { data, isPending, error };
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
  const isPending = resolved[resolved.length - 1].isPending;

  return { data, isPending, error };
}

function _destructorResource(source) {
  source.preload();

  let data;
  let error;
  let isPending;
  if (source.status === RESOURCE_RESOLVED) {
    data = source.value;
    isPending = false;
  } else if (source.status === RESOURCE_REJECTED) {
    isPending = false;
    error = source.value;
  } else {
    isPending = true;
  }

  return {
    data,
    error,
    isPending,
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
