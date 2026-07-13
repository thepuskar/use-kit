import { useCallback, useEffect, useRef } from "react";

/**
 * Returns a stable function that reports whether the component is still mounted.
 * Prefer calling it (`isMounted()`) rather than treating the return value as a boolean.
 */
export function useMounted(): () => boolean {
  const isMounted = useRef(false);

  const getIsMounted = useCallback(() => isMounted.current, []);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return getIsMounted;
}
