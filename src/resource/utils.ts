const isAsyncFunction = (value: (...args: any) => any) =>
  value?.constructor?.name === "AsyncFunction";

/** Determine whether the given `promise` is a Promise. */
function isPromise(promise: any): boolean {
  return (
    !!promise &&
    typeof promise.then === "function" &&
    typeof promise.catch === "function"
  );
}

export { isAsyncFunction, isPromise };
