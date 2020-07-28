//@ts-check

import * as React from "react";

const RESOURCE_PENDING = 0;
const RESOURCE_RESOLVED = 1;
const RESOURCE_REJECTED = 2;

/**
 * @template V
 * @typedef {{
 *   read(): V;
 *   preload(): void;
 *   status: RESOURCE_PENDING | RESOURCE_RESOLVED | RESOURCE_REJECTED;
 *   value: Promise<V> | any;
 * }} Resource
 */

const ReactCurrentDispatcher =
  // @ts-ignore
  React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
    .ReactCurrentDispatcher;

function readContext(Context, observedBits) {
  const dispatcher = ReactCurrentDispatcher.current;
  if (dispatcher === null) {
    throw new Error(
      "react-cache: read and preload may only be called from within a " +
        "component's render. They are not supported in event handlers or " +
        "lifecycle methods.",
    );
  }
  return dispatcher.readContext(Context, observedBits);
}

const CacheContext = React.createContext(null);

/**
 * @template V
 * @param {Resource<V>} resource
 * @param {() => Promise<V>} fetch
 * @returns {Resource<V>}
 */
function accessResult(resource, fetch) {
  function getResult() {
    const thenable = fetch().catch((error) => {
      if (resource.status === RESOURCE_PENDING) {
        resource.status = RESOURCE_REJECTED;
        resource.value = error;
      }
    });

    thenable.then((value) => {
      if (resource.status === RESOURCE_PENDING) {
        resource.status = RESOURCE_RESOLVED;
        resource.value = value;
      }
    });

    resource.status = RESOURCE_PENDING;
    resource.value = thenable;

    return resource;
  }

  if (resource.status === undefined) {
    const newResult = getResult();
    return newResult;
  } else {
    return resource;
  }
}

/**
 * @template V
 * @param {() => Promise<V>} fetch
 * @returns {Resource<V>}
 */
function createResource(fetch) {
  /** @type {Resource<V>} */
  const resource = {
    status: undefined,
    value: undefined,
    /** @returns {V} */
    read() {
      // react-cache currently doesn't rely on context, but it may in the
      // future, so we read anyway to prevent access outside of render.
      readContext(CacheContext);
      /** @type {Resource<V>} */
      const result = accessResult(resource, fetch);

      switch (result.status) {
        case RESOURCE_PENDING: {
          const suspender = result.value;
          throw suspender;
        }
        case RESOURCE_RESOLVED: {
          const value = result.value;
          return value;
        }
        case RESOURCE_REJECTED: {
          const error = result.value;
          throw error;
        }
        default:
          // Should be unreachable
          return undefined;
      }
    },

    /** @returns {void} */
    preload() {
      accessResult(resource, fetch);
    },
  };

  return resource;
}

export {
  createResource,
  RESOURCE_PENDING,
  RESOURCE_REJECTED,
  RESOURCE_RESOLVED,
};
