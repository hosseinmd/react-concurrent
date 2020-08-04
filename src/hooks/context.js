//@ts-check
import React, { createContext, useMemo, useContext } from "react";
import { useFetch } from "./fetch";
import { useResource } from "./resource";

/**
 * @template V, P
 * @param {(props: P) => Promise<V>} fetchFun
 * @returns {{
 *   Provider: React.FC<P>;
 *   useResource: import("./resource").ResourceResponse<V>;
 *   useRefetch(): () => void;
 * }}
 */
function createFetchContext(fetchFun) {
  /** @type {React.Context<any>} */
  const Context = createContext(null);
  const ContextRefetch = createContext(() => {});

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
