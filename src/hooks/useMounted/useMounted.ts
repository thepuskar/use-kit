import { useCallback, useEffect, useRef } from "react";

/**
 * This function returns a boolean value indicating whether a component is currently mounted or not.
 * @returns A boolean value indicating whether the component is currently mounted or not.
 */
export function useMounted() {
  const isMounted = useRef<boolean>(false);

  const mouted = useCallback(() => isMounted.current, []);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return mouted;
}
