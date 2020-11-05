import { useCreateResource, useResource } from "./resource";
import { UseFetchingCallback, UseFetching } from "../types";

const useFetchingCallback: UseFetchingCallback = (fetchFunc) => {
  const { resource, refetch } = useCreateResource(fetchFunc, [], {
    startFetchAtFirstRender: false,
  });
  const { data, error, isLoading } = useResource(resource);

  return { data, error, isLoading, refetch };
};

const useFetching: UseFetching = (fetchFunc, deps, options) => {
  const { resource, refetch } = useCreateResource(fetchFunc, deps, options);
  const { data, error, isLoading } = useResource<any>(resource);

  return { data, error, isLoading, refetch };
};

export { useFetching, useFetchingCallback };
