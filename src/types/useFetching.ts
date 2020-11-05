import {
  UseCreateResource,
  UseResourceResponse,
  UseCreateResourceResponse,
} from "./resource";
import { AsyncReturnType } from "./utils";

type UseFetchingResponse<T extends (...args: any) => any> = UseResourceResponse<
  AsyncReturnType<T>
> & {
  refetch: UseCreateResourceResponse<T>["refetch"];
};

export type UseFetching = <T extends (...args: any) => any>(
  ...args: Parameters<UseCreateResource>
) => UseFetchingResponse<T>;
