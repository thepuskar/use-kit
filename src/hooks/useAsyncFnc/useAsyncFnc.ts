import { DependencyList, useCallback, useRef, useState } from "react";

import { AsyncFnReturn, AsyncState, FunctionReturningPromise, PromiseType } from "../../misc/types";
import { useMounted } from "../useMounted";

type StateFromFunctionReturningPromise<T extends FunctionReturningPromise> = AsyncState<
  PromiseType<ReturnType<T>>
>;

/**
 * It returns a state and a callback function for handling asynchronous
 * operations with automatic loading and error handling.
 * @param {T} fn - The asynchronous function that will be called when the returned callback is invoked.
 * @param {DependencyList} deps - `deps` is an optional array of dependencies that are passed to the
 * `useCallback` hook. These dependencies are used to determine when the `callback` function should be
 * re-created. If any of the dependencies change, the `callback` function will be re-created with the
 * new values. If `
 * @returns The function `useAsyncFn` returns an array containing two elements: the first element is an
 * object representing the current state of the asynchronous function, and the second element is the
 * callback function that can be used to trigger the asynchronous function. The state object contains
 * properties such as `loading`, `value`, and `error` to indicate the current status of the
 * asynchronous function. The callback function is a memo
 */
export function useAsyncFnc<T extends FunctionReturningPromise>(
  fn: T,
  deps: DependencyList = [],
  initialState: StateFromFunctionReturningPromise<T> = { loading: false },
): AsyncFnReturn<T> {
  const [state, setState] = useState<StateFromFunctionReturningPromise<T>>(initialState);
  const lastCallId = useRef(0);
  const isMounted = useMounted();

  const execute = useCallback(
    async (...args: Parameters<T>): Promise<PromiseType<ReturnType<T>>> => {
      const callId = ++lastCallId.current;
      setState((prevState) => ({ ...prevState, loading: true }));

      try {
        const result = await fn(...args);

        if (isMounted() && callId === lastCallId.current) {
          setState({ value: result, loading: false });
        }

        return result;
      } catch (error) {
        if (isMounted() && callId === lastCallId.current) {
          setState({ error, loading: false });
        }

        throw error;
      }
    },
    deps,
  );

  return [state, execute as T];
}
