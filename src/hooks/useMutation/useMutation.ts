import { useCallback, useEffect, useRef, useState } from "react";

export type MutationStatus = "idle" | "loading" | "success" | "error";
export type MutationVariables<TVariables> = [TVariables] extends [void]
  ? void | undefined
  : TVariables;
export type MutationCallbackResult<T> = T | Promise<T>;

export interface MutationFunctionContext {
  signal: AbortSignal;
}

export type MutationFunction<TData, TVariables> = (
  variables: MutationVariables<TVariables>,
  context: MutationFunctionContext,
) => Promise<TData>;

export interface UseMutationOptions<
  TData,
  TError extends Error = Error,
  TVariables = void,
  TContext = unknown,
> {
  initialData?: TData | null;
  onMutate?: (
    variables: MutationVariables<TVariables>,
  ) => MutationCallbackResult<TContext | undefined>;
  onSuccess?: (
    data: TData,
    variables: MutationVariables<TVariables>,
    context: TContext | undefined,
  ) => MutationCallbackResult<void>;
  onError?: (
    error: TError,
    variables: MutationVariables<TVariables>,
    context: TContext | undefined,
  ) => MutationCallbackResult<void>;
  onSettled?: (
    data: TData | null,
    error: TError | null,
    variables: MutationVariables<TVariables>,
    context: TContext | undefined,
  ) => MutationCallbackResult<void>;
}

export interface UseMutationResult<TData, TError extends Error = Error, TVariables = void> {
  data: TData | null;
  error: TError | null;
  status: MutationStatus;
  variables: MutationVariables<TVariables> | null;
  submittedAt: number | null;
  loading: boolean;
  isPending: boolean;
  isIdle: boolean;
  isSuccess: boolean;
  isError: boolean;
  mutate: (variables?: MutationVariables<TVariables>) => void;
  mutateAsync: (variables?: MutationVariables<TVariables>) => Promise<TData>;
  reset: () => void;
  abort: () => void;
}

interface MutationState<TData, TError extends Error, TVariables> {
  data: TData | null;
  error: TError | null;
  status: MutationStatus;
  variables: MutationVariables<TVariables> | null;
  submittedAt: number | null;
}

function getInitialState<TData, TError extends Error, TVariables>(
  initialData: TData | null,
): MutationState<TData, TError, TVariables> {
  return {
    data: initialData,
    error: null,
    status: "idle",
    variables: null,
    submittedAt: null,
  };
}

function createAbortError(): Error {
  if (typeof DOMException !== "undefined") {
    return new DOMException("Mutation aborted", "AbortError");
  }

  const error = new Error("Mutation aborted");
  error.name = "AbortError";
  return error;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

/**
 * Run async mutations with status tracking, lifecycle callbacks, and cancellation.
 */
export function useMutation<
  TData,
  TError extends Error = Error,
  TVariables = void,
  TContext = unknown,
>(
  mutationFn: MutationFunction<TData, TVariables>,
  options: UseMutationOptions<TData, TError, TVariables, TContext> = {},
): UseMutationResult<TData, TError, TVariables> {
  const initialDataRef = useRef<TData | null>(options.initialData ?? null);
  const [state, setState] = useState<MutationState<TData, TError, TVariables>>(() =>
    getInitialState<TData, TError, TVariables>(initialDataRef.current),
  );

  const mountedRef = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const mutationFnRef = useRef(mutationFn);
  const onMutateRef = useRef(options.onMutate);
  const onSuccessRef = useRef(options.onSuccess);
  const onErrorRef = useRef(options.onError);
  const onSettledRef = useRef(options.onSettled);

  mutationFnRef.current = mutationFn;
  onMutateRef.current = options.onMutate;
  onSuccessRef.current = options.onSuccess;
  onErrorRef.current = options.onError;
  onSettledRef.current = options.onSettled;

  useEffect(() => {
    return () => {
      mountedRef.current = false;

      if (controllerRef.current) {
        controllerRef.current.abort();
        controllerRef.current = null;
      }
    };
  }, []);

  const setStateIfMounted = useCallback(
    (
      updater:
        | MutationState<TData, TError, TVariables>
        | ((
            currentState: MutationState<TData, TError, TVariables>,
          ) => MutationState<TData, TError, TVariables>),
    ) => {
      if (!mountedRef.current) {
        return;
      }

      setState(updater);
    },
    [],
  );

  const abort = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }

    setStateIfMounted((currentState) => {
      if (currentState.status !== "loading") {
        return currentState;
      }

      return {
        ...currentState,
        error: null,
        status: currentState.data === null ? "idle" : "success",
      };
    });
  }, [setStateIfMounted]);

  const mutateAsync = useCallback(
    async (variables?: MutationVariables<TVariables>) => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }

      const controller = new AbortController();
      controllerRef.current = controller;

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      const submittedAt = Date.now();

      setStateIfMounted((currentState) => ({
        ...currentState,
        error: null,
        status: "loading",
        variables: (variables ?? undefined) as MutationVariables<TVariables>,
        submittedAt,
      }));

      let context: TContext | undefined;

      try {
        context = await onMutateRef.current?.(
          (variables ?? undefined) as MutationVariables<TVariables>,
        );

        const data = await mutationFnRef.current(
          (variables ?? undefined) as MutationVariables<TVariables>,
          {
            signal: controller.signal,
          },
        );

        if (controller.signal.aborted || requestId !== requestIdRef.current) {
          throw createAbortError();
        }

        controllerRef.current = null;

        setStateIfMounted({
          data,
          error: null,
          status: "success",
          variables: (variables ?? undefined) as MutationVariables<TVariables>,
          submittedAt,
        });

        await onSuccessRef.current?.(
          data,
          (variables ?? undefined) as MutationVariables<TVariables>,
          context,
        );
        await onSettledRef.current?.(
          data,
          null,
          (variables ?? undefined) as MutationVariables<TVariables>,
          context,
        );

        return data;
      } catch (error) {
        if (
          controller.signal.aborted ||
          isAbortError(error) ||
          requestId !== requestIdRef.current
        ) {
          if (requestId === requestIdRef.current) {
            controllerRef.current = null;

            setStateIfMounted((currentState) => ({
              ...currentState,
              error: null,
              status: currentState.data === null ? "idle" : "success",
            }));
          }

          throw createAbortError();
        }

        controllerRef.current = null;

        const resolvedError = (
          error instanceof Error ? error : new Error("Unknown mutation error")
        ) as TError;

        setStateIfMounted((currentState) => ({
          ...currentState,
          error: resolvedError,
          status: "error",
          variables: (variables ?? undefined) as MutationVariables<TVariables>,
          submittedAt,
        }));

        await onErrorRef.current?.(
          resolvedError,
          (variables ?? undefined) as MutationVariables<TVariables>,
          context,
        );
        await onSettledRef.current?.(
          null,
          resolvedError,
          (variables ?? undefined) as MutationVariables<TVariables>,
          context,
        );

        throw resolvedError;
      }
    },
    [setStateIfMounted],
  );

  const mutate = useCallback(
    (variables?: MutationVariables<TVariables>) => {
      void mutateAsync(variables).catch(() => {
        // `mutate` is fire-and-forget by design. Use `mutateAsync` if you need the promise.
      });
    },
    [mutateAsync],
  );

  const reset = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }

    setStateIfMounted(getInitialState<TData, TError, TVariables>(initialDataRef.current));
  }, [setStateIfMounted]);

  return {
    data: state.data,
    error: state.error,
    status: state.status,
    variables: state.variables,
    submittedAt: state.submittedAt,
    loading: state.status === "loading",
    isPending: state.status === "loading",
    isIdle: state.status === "idle",
    isSuccess: state.status === "success",
    isError: state.status === "error",
    mutate,
    mutateAsync,
    reset,
    abort,
  };
}
