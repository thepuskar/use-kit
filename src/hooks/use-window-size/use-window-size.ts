"use client";

import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from "react";

import {
  UseWindowSizeOptions,
  UseWindowSizeReturn,
  WindowSizeBreakpoints,
  WindowSizeStoreSnapshot,
} from "./window-size.types";
import {
  createWindowSizeSnapshot,
  DEFAULT_WINDOW_SIZE_BREAKPOINTS,
  getWindowSizeBreakpoint,
  getWindowSizeBreakpointSignature,
  getWindowSizeDeviceFlags,
  getWindowSizeOrientation,
  getWindowSizeRemountKey,
  isAboveWindowSizeBreakpoint,
  isBelowWindowSizeBreakpoint,
  isBetweenWindowSizeBreakpoints,
} from "./window-size.utils";
import {
  createWindowSizeStoreServerSnapshot,
  getWindowSizeStoreSnapshot,
  subscribeToWindowSizeStore,
} from "./window-size-store";

/**
 * Subscribe to viewport size through React's external store contract.
 */
export function useWindowSize<
  TBreakpoints extends WindowSizeBreakpoints = typeof DEFAULT_WINDOW_SIZE_BREAKPOINTS,
>(options: UseWindowSizeOptions<TBreakpoints> = {}): UseWindowSizeReturn<TBreakpoints> {
  const {
    initialWidth,
    initialHeight,
    breakpoints = DEFAULT_WINDOW_SIZE_BREAKPOINTS as unknown as TBreakpoints,
    debounceMs,
    throttleMs,
    enabled = true,
    useVisualViewport = false,
    round = false,
  } = options;
  const breakpointSignature = useMemo(
    () => getWindowSizeBreakpointSignature(breakpoints),
    [breakpoints],
  );
  const stableBreakpoints = useMemo(() => breakpoints, [breakpointSignature]);
  const disabledSnapshotRef = useRef<WindowSizeStoreSnapshot | null>(null);
  const serverSnapshot = useMemo(
    () =>
      createWindowSizeStoreServerSnapshot({
        initialWidth,
        initialHeight,
      }),
    [initialHeight, initialWidth],
  );

  useEffect(() => {
    if (enabled) {
      disabledSnapshotRef.current = null;
    }
  }, [enabled]);

  const getSnapshot = useCallback((): WindowSizeStoreSnapshot => {
    if (!enabled) {
      disabledSnapshotRef.current ??= getWindowSizeStoreSnapshot();
      return disabledSnapshotRef.current;
    }

    return getWindowSizeStoreSnapshot();
  }, [enabled]);

  const getServerSnapshot = useCallback(() => serverSnapshot, [serverSnapshot]);

  const subscribe = useCallback(
    (listener: () => void) =>
      subscribeToWindowSizeStore(listener, {
        debounceMs,
        throttleMs,
        enabled,
        useVisualViewport,
      }),
    [debounceMs, enabled, throttleMs, useVisualViewport],
  );

  const storeSnapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const snapshot = useMemo(
    () =>
      createWindowSizeSnapshot(storeSnapshot, {
        useVisualViewport,
        round,
      }),
    [round, storeSnapshot, useVisualViewport],
  );

  return useMemo<UseWindowSizeReturn<TBreakpoints>>(() => {
    const orientation = getWindowSizeOrientation(snapshot.width, snapshot.height);
    const breakpoint = getWindowSizeBreakpoint(snapshot.width, stableBreakpoints);
    const deviceFlags = getWindowSizeDeviceFlags(snapshot.width, stableBreakpoints);

    return {
      ...snapshot,
      orientation,
      isPortrait: orientation === "portrait",
      isLandscape: orientation === "landscape",
      ...deviceFlags,
      breakpoint,
      isAbove: (key) => isAboveWindowSizeBreakpoint(snapshot.width, stableBreakpoints, key),
      isBelow: (key) => isBelowWindowSizeBreakpoint(snapshot.width, stableBreakpoints, key),
      isBetween: (min, max) =>
        isBetweenWindowSizeBreakpoints(snapshot.width, stableBreakpoints, min, max),
      remountKey: getWindowSizeRemountKey(breakpoint, orientation),
    };
  }, [snapshot, stableBreakpoints]);
}
