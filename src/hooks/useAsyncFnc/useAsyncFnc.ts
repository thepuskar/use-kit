import { DependencyList, useCallback, useRef, useState } from "react";

import { AsyncFnReturn, AsyncState, FunctionReturningPromise, PromiseType } from "../../misc/types";
import { useMounted } from "../useMounted";

type StateFromFunctionReturningPromise<T extends FunctionReturningPromise> = AsyncState<
  PromiseType<ReturnType<T>>
>;

/**
 * Manual async runner: returns `[state, execute]` without auto-invoking `fn`.
 *
 * Prefer `useMutation` or `useFetch` for new code when those APIs fit.
 *
 * @param fn - The asynchronous function invoked by `execute`.
 * @param deps - Dependency list for the memoized `execute` callback.
 * @param initialState - Initial async state (default `{ loading: false }`).
 */
export function useAsyncFn<T extends FunctionReturningPromise>(
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
    // Caller-controlled dependency list (same pattern as useCallback(fn, deps)).
    deps,
  );

  return [state, execute as T];
}

/**
 * @deprecated Use {@link useAsyncFn} instead. Kept for backward compatibility.
 */
export const useAsyncFnc = useAsyncFn;
