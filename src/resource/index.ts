import React, { createContext } from "react";
import {
  Resource,
  RESOURCE_PENDING,
  RESOURCE_REJECTED,
  RESOURCE_RESOLVED,
} from "../types";
import { AsyncReturnType } from "../types/utils";
import { isPromise } from "./utils";

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

const CacheContext = createContext(null);

function getResult<T extends (...args: any) => any, I>(
  resource: Resource<T, I>,
  fetch: () => any,
) {
  let error;
  let result;

  try {
    result = fetch();
  } catch (e) {
    error = e;
  }

  if (isPromise(result)) {
    const thenable = result.catch((error: Error) => {
      if (resource.status === RESOURCE_PENDING) {
        resource.status = RESOURCE_REJECTED;
        resource.error = error;
        resource.isLoading = false;
      }
    });

    thenable.then((value: any) => {
      if (resource.status === RESOURCE_PENDING) {
        resource.status = RESOURCE_RESOLVED;
        resource.value = value;
        resource.isLoading = false;
      }
    });

    resource.status = RESOURCE_PENDING;
    resource.promise = thenable;
    resource.isLoading = true;

    return resource;
  }

  resource.status = RESOURCE_RESOLVED;
  resource.value = result;
  resource.error = error;

  return resource;
}

function accessResult<T extends (...args: any) => any, I>(
  resource: Resource<T, I>,
  fetch: T,
): Resource<T, I> {
  if (resource.status === undefined) {
    const newResult = getResult(resource, fetch);
    return newResult;
  } else {
    return resource;
  }
}

function createResource<T extends (...args: any) => any, I = undefined>(
  fetch: T,
  initialValue?: I,
): Resource<T, I> {
  const resource: Resource<T, I> = {
    status: undefined,
    value: initialValue,
    error: undefined,
    promise: undefined,
    isLoading: false,
    read() {
      // react-concurrent doesn't rely on context, but it may in the
      // future, so we read anyway to prevent access outside of render.
      readContext(CacheContext);
      const result = accessResult(resource, fetch);

      switch (result.status) {
        case RESOURCE_PENDING: {
          throw result.promise;
        }
        case RESOURCE_RESOLVED: {
          return result.value as AsyncReturnType<T>;
        }
        case RESOURCE_REJECTED: {
          throw result.error;
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

export { createResource };
