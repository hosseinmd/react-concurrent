import * as React from "react";
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

const CacheContext = React.createContext(null);

function getResult(resource: Resource<any>, fetch: () => any) {
  // if (isAsyncFunction(fetch)) {
  //   const thenable = fetch().catch((error: any) => {
  //     if (resource.status === RESOURCE_PENDING) {
  //       resource.status = RESOURCE_REJECTED;
  //       resource.value = error;
  //     }
  //   });

  //   thenable.then((value: any) => {
  //     if (resource.status === RESOURCE_PENDING) {
  //       resource.status = RESOURCE_RESOLVED;
  //       resource.value = value;
  //     }
  //   });

  //   resource.status = RESOURCE_PENDING;
  //   resource.value = thenable;

  //   return resource;
  // }

  const result = fetch();

  if (isPromise(result)) {
    const thenable = result.catch((error: any) => {
      if (resource.status === RESOURCE_PENDING) {
        resource.status = RESOURCE_REJECTED;
        resource.value = error;
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
    resource.value = thenable;
    resource.isLoading = true;

    return resource;
  }

  resource.status = RESOURCE_RESOLVED;
  resource.value = result;

  return resource;
}

function accessResult<T extends (...args: any) => any>(
  resource: Resource<T>,
  fetch: T,
): Resource<T> {
  if (resource.status === undefined) {
    const newResult = getResult(resource, fetch);
    return newResult;
  } else {
    return resource;
  }
}

function createResource<T extends (...args: any) => any>(
  fetch: T,
): Resource<T> {
  const resource: Resource<T> = {
    status: undefined,
    value: undefined,
    isLoading: false,
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
          const value = result.value as AsyncReturnType<T>;
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

export { createResource };
