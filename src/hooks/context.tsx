//@ts-check
import React, { createContext, useMemo, useContext } from "react";
import { useFetch } from "./fetch";
import { useResource, ResourceResponse } from "./resource";

type Refetch = () => void;

interface FetchContext<P, V> {
  Provider: React.FC<P>;
  useResource: ResourceResponse<V>;
  useRefetch(): Refetch;
}

function createFetchContext<V, P>(
  fetchFun: (props: P) => Promise<V>,
): FetchContext<P, V> {
  const Context = createContext<ResourceResponse<V> | null>(null);
  const ContextRefetch = createContext<Refetch>(() => {});

  /** @param {V} props */
  // @ts-ignore
  function Provider({ children, ...props }) {
    // @ts-ignore
    const { resource, refetch } = useFetch(fetchFun, props);
    const { data, isLoading, error } = useResource(resource);

    const value = useMemo(
      () => ({
        data,
        isLoading,
        error,
      }),
      [data, isLoading, error],
    );

    return (
      <ContextRefetch.Provider value={refetch}>
        <Context.Provider {...{ value, children }} />
      </ContextRefetch.Provider>
    );
  }

  return {
    // @ts-ignore
    Provider,
    // @ts-ignore
    useResource() {
      return useContext(Context);
    },
    useRefetch() {
      return useContext(ContextRefetch);
    },
  };
}

export { createFetchContext };
