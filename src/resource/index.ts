import * as React from "react";
import {
  Resource,
  RESOURCE_PENDING,
  RESOURCE_REJECTED,
  RESOURCE_RESOLVED,
} from "../types";

const ReactCurrentDispatcher =
  // @ts-ignore
  React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
    .ReactCurrentDispatcher;

function readContext(Context: React.Context<any>) {
  const dispatcher = ReactCurrentDispatcher.current;
  if (dispatcher === null) {
    throw new Error(
      "react-cache: read and preload may only be called from within a " +
        "component's render. They are not supported in event handlers or " +
        "lifecycle methods.",
    );
  }
  return dispatcher.readContext(Context);
}

const CacheContext = React.createContext(null);

function accessResult<V>(
  resource: Resource<V>,
  fetch: () => Promise<V>,
): Resource<V> {
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

function createResource<V>(fetch: () => Promise<V>): Resource<V> {
  const resource: Resource<V> = {
    status: undefined,
    value: undefined,
    read() {
      // react-cache currently doesn't rely on context, but it may in the
      // future, so we read anyway to prevent access outside of render.
      readContext(CacheContext);
      const result = accessResult(resource, fetch);

      switch (result.status) {
        case RESOURCE_PENDING: {
          const suspender = result.value;
          throw suspender;
        }
        case RESOURCE_RESOLVED: {
          // eslint-disable-next-line prettier/prettier
          const value = result.value as V;
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

    preload() {
      accessResult(resource, fetch);
    },
  };

  return resource;
}

export {
  createResource,
};
