import { useCallback, useRef, useState } from "react";

import { useIsomorphicEffect } from "../useIsomorphicEffect";

export type TimeoutDelay = number | null | undefined;

export interface UseTimeoutOptions {
  autoStart?: boolean;
}

export interface UseTimeoutReturn {
  start: () => void;
  reset: () => void;
  clear: () => void;
  isPending: boolean;
}

export function useTimeout(
  callback: () => void,
  delay: TimeoutDelay,
  options: UseTimeoutOptions = {},
): UseTimeoutReturn {
  const { autoStart = true } = options;
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPending, setIsPending] = useState(false);

  useIsomorphicEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const clear = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setIsPending(false);
  }, []);

  const start = useCallback(() => {
    if (delay === null || delay === undefined) {
      clear();
      return;
    }

    clear();
    setIsPending(true);

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      setIsPending(false);
      callbackRef.current();
    }, delay);
  }, [clear, delay]);

  useIsomorphicEffect(() => {
    if (!autoStart || delay === null || delay === undefined) {
      clear();
      return clear;
    }

    start();
    return clear;
  }, [autoStart, clear, delay, start]);

  const reset = useCallback(() => {
    start();
  }, [start]);

  return { start, reset, clear, isPending };
}
