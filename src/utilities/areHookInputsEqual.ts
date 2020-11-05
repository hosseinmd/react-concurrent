import { isEqual } from "lodash-es";

// copied from React-Reconciler
const __DEV__ = process.env.NODE_ENV !== "production";

function areHookInputsEqual(nextDeps: any[], prevDeps: any[] | null) {
  if (!Array.isArray(prevDeps)) {
    console.error(
      "React-Concurrent: Dependencies of hooks should be an array but received " +
        typeof prevDeps,
    );
    //Backward compatible
    return isEqual(prevDeps, nextDeps);
  }

  if (!Array.isArray(nextDeps)) {
    console.error(
      "React-Concurrent: Dependencies of hooks should be an array but received " +
        typeof nextDeps,
    );

    //Backward compatible
    return isEqual(prevDeps, nextDeps);
  }

  if (__DEV__) {
    // Don't bother comparing lengths in prod because these arrays should be
    // passed inline.
    if (nextDeps.length !== prevDeps.length) {
      console.error(
        "React-Concurrent: Dependencies passed to hook argument changed size between renders. The " +
          "order and size of this array must remain constant.\n\n" +
          "Previous: %s\n" +
          "Incoming: %s",
        `[${prevDeps.join(", ")}]`,
        `[${nextDeps.join(", ")}]`,
      );
    }
  }
  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (Object.is(nextDeps[i], prevDeps[i])) {
      continue;
    }
    return false;
  }
  return true;
}

export { areHookInputsEqual };
