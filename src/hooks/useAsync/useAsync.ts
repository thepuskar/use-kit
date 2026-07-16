import { DependencyList, useEffect } from "react";

import { AsyncFnReturn, FunctionReturningPromise } from "../../misc/types";
import { useAsyncFn } from "../useAsyncFnc";

/**
 * Run an async function with tracked loading/error/value state.
 *
 * Pass `immediate: true` to execute on mount (and whenever `execute` identity changes).
 * When `immediate` is false (default), state starts idle (`loading: false`) until `execute` is called.
 *
 * @param fn - Async function to track.
 * @param deps - Dependency list passed through to the underlying callback.
 * @param immediate - When true, execute on mount. Default false.
 */
export function useAsync<T extends FunctionReturningPromise>(
  fn: T,
  deps: DependencyList = [],
  immediate: boolean = false,
): AsyncFnReturn<T> {
  const [state, execute] = useAsyncFn(fn, deps, {
    loading: immediate,
  });

  useEffect(() => {
    if (immediate) {
      void execute();
    }
  }, [execute, immediate]);

  return [state, execute as T];
}
