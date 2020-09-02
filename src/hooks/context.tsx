import React, { createContext, useMemo, useContext } from "react";
import { useFetch } from "./fetch";
import { useResource } from "./resource";
import { UseResourceResponse } from "../types";
import { AsyncReturnType } from "../types/utils";

type Refetch = () => void;

interface FetchContext<P, V> {
  Provider: React.FC<P>;
  useResource: UseResourceResponse<V>;
  useRefetch(): Refetch;
}

function createFetchContext<T extends (...args: any) => any>(
  fetchFun: T,
): FetchContext<Parameters<T>, AsyncReturnType<T>> {
  const Context = createContext<UseResourceResponse<AsyncReturnType<T>>>(
    null as any,
  );
  const ContextRefetch = createContext<Refetch>(() => {});

  function Provider({ children, ...props }: Parameters<T>) {
    const { resource, refetch } = useFetch(fetchFun, props as Parameters<T>);
    const resourceResponse = useResource(resource);

    const value = useMemo(
      () => resourceResponse,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      Object.values(resourceResponse),
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
