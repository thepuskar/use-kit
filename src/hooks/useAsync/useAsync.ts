import { DependencyList, useEffect } from "react";

import { AsyncFnReturn, FunctionReturningPromise } from "../../misc/types";
import { useAsyncFnc } from "../useAsyncFnc";

/**
 * It returns a hook for executing an asynchronous function with
 * optional immediate execution.
 * @param {T} fn - A function that returns a Promise. This function will be executed asynchronously.
 * @param {DependencyList} deps - The `deps` parameter is an optional array of dependencies that the
 * `fn` function depends on. It is used to determine when the `fn` function should be re-executed. If
 * any of the dependencies change, the `fn` function will be re-executed. If `deps` is
 * @param {boolean} [immidate=false] - The "immidate" parameter is a boolean flag that determines
 * whether the async function should be executed immediately upon component mount or not. If set to
 * true, the function will be executed immediately, otherwise it will only be executed when the
 * "execute" function is called.
 * @returns The `useAsync` function returns an array with two elements: the first element is an object
 * representing the current state of the asynchronous function (with properties such as `loading`,
 * `error`, and `data`), and the second element is a function that can be called to execute the
 * asynchronous function. The second element is typed as the same function passed in as the first
 * argument (`T`).
 */
export function useAsync<T extends FunctionReturningPromise>(
  fn: T,
  deps: DependencyList = [],
  immidate: boolean = false,
): AsyncFnReturn<T> {
  const [state, execute] = useAsyncFnc(fn, deps, {
    loading: true,
  });

  useEffect(() => {
    if (immidate) execute();
  }, [execute, immidate]);

  return [state, execute as T];
}
