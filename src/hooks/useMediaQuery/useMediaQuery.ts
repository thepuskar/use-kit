import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from "react";

import {
  getFallbackSnapshot,
  getMediaQuerySnapshot,
  MediaQuerySnapshot,
  subscribeToMediaQuery,
} from "./store";
import { UseMediaQueryOptions, UseMediaQueryReturn } from "./types";

const DEFAULT_VALUE = false;

/**
 * Subscribe to a CSS media query with SSR-safe snapshots and shared browser listeners.
 */
export function useMediaQuery(
  query: string,
  options: UseMediaQueryOptions = {},
): UseMediaQueryReturn {
  const {
    defaultValue = DEFAULT_VALUE,
    ssrValue = defaultValue,
    initializeWithValue = true,
    onChange,
  } = options;

  const onChangeRef = useRef(onChange);
  const didSubscribeRef = useRef(false);
  const currentQueryRef = useRef(query);

  onChangeRef.current = onChange;

  if (currentQueryRef.current !== query) {
    currentQueryRef.current = query;
    didSubscribeRef.current = false;
  }

  const getSnapshot = useCallback((): MediaQuerySnapshot => {
    if (!initializeWithValue && !didSubscribeRef.current) {
      return getFallbackSnapshot(defaultValue);
    }

    const snapshot = getMediaQuerySnapshot(query);
    return snapshot.supported ? snapshot : getFallbackSnapshot(defaultValue);
  }, [defaultValue, initializeWithValue, query]);

  const getServerSnapshot = useCallback(() => getFallbackSnapshot(ssrValue), [ssrValue]);

  const subscribe = useCallback(
    (listener: () => void) => {
      didSubscribeRef.current = true;
      return subscribeToMediaQuery(query, listener);
    },
    [query],
  );

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const matches = snapshot.matches;
  const supported = snapshot.supported;
  const previousMatchesRef = useRef(matches);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      previousMatchesRef.current = matches;
      return;
    }

    if (Object.is(previousMatchesRef.current, matches)) {
      return;
    }

    previousMatchesRef.current = matches;
    onChangeRef.current?.(matches);
  }, [matches]);

  return useMemo<UseMediaQueryReturn>(
    () => ({
      matches,
      query,
      supported,
    }),
    [matches, query, supported],
  );
}
