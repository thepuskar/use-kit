"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import { detectMissingClientFeatures, getClientFeatureRequirementKey } from "./feature-detection";
import type {
  ClientOnlyChildren,
  ClientOnlyProps,
  ClientOnlyState,
  ClientOnlyStrategy,
  MissingClientFeature,
} from "./types";

type Cleanup = () => void;

type ClientOnlyIdleDeadline = {
  didTimeout: boolean;
  timeRemaining: () => number;
};

type WindowWithIdleCallback = Window &
  typeof globalThis & {
    requestIdleCallback?: (callback: (deadline: ClientOnlyIdleDeadline) => void) => number;
    cancelIdleCallback?: (handle: number) => void;
  };

const DEFAULT_STRATEGY: ClientOnlyStrategy = "effect";

const INITIAL_STATE: ClientOnlyState = {
  isClient: false,
  isReady: false,
  isSupported: true,
  missingFeatures: [],
};

function normalizeDelay(delay: number | undefined): number {
  if (delay === undefined || Number.isNaN(delay)) {
    return 0;
  }

  return Math.max(0, delay);
}

function areMissingFeaturesEqual(
  left: MissingClientFeature[],
  right: MissingClientFeature[],
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((feature, index) => feature === right[index]);
}

function getBrowserWindow(): WindowWithIdleCallback | null {
  return typeof window === "undefined" ? null : (window as WindowWithIdleCallback);
}

function scheduleWithStrategy(strategy: ClientOnlyStrategy, callback: () => void): Cleanup {
  if (strategy === "effect") {
    callback();
    return () => undefined;
  }

  const browserWindow = getBrowserWindow();

  if (strategy === "idle") {
    if (browserWindow?.requestIdleCallback) {
      const handle = browserWindow.requestIdleCallback(() => {
        callback();
      });

      return () => {
        browserWindow.cancelIdleCallback?.(handle);
      };
    }

    const handle = setTimeout(callback, 0);
    return () => {
      clearTimeout(handle);
    };
  }

  if (browserWindow?.requestAnimationFrame) {
    const handle = browserWindow.requestAnimationFrame(() => {
      callback();
    });

    return () => {
      browserWindow.cancelAnimationFrame(handle);
    };
  }

  const handle = setTimeout(callback, 0);
  return () => {
    clearTimeout(handle);
  };
}

function withHydrationWarning(node: React.ReactNode, suppressHydrationWarning: boolean) {
  if (!suppressHydrationWarning || node === null || node === undefined) {
    return <>{node}</>;
  }

  if (React.isValidElement(node) && node.type !== React.Fragment) {
    return React.cloneElement(node, {
      suppressHydrationWarning,
    } as Partial<React.HTMLAttributes<HTMLElement>>);
  }

  return <span suppressHydrationWarning>{node}</span>;
}

function renderChildren(children: ClientOnlyChildren, state: ClientOnlyState) {
  if (typeof children === "function") {
    return <>{children(state)}</>;
  }

  return <>{children}</>;
}

export function ClientOnly({
  children,
  fallback = null,
  unsupportedFallback,
  delay,
  strategy = DEFAULT_STRATEGY,
  require: requirements,
  suppressHydrationWarning = false,
  onReady,
  onUnsupported,
  onError,
}: ClientOnlyProps) {
  const normalizedDelay = normalizeDelay(delay);
  const requirementKey = getClientFeatureRequirementKey(requirements);
  const callbacksRef = useRef({
    onError,
    onReady,
    onUnsupported,
  });
  const requirementsRef = useRef(requirements);
  const readyCallbackFiredRef = useRef(false);
  const unsupportedCallbackKeyRef = useRef<string | null>(null);
  const [state, setState] = useState<ClientOnlyState>(INITIAL_STATE);
  const prevDepsRef = useRef({ normalizedDelay, requirementKey, strategy });

  callbacksRef.current = {
    onError,
    onReady,
    onUnsupported,
  };
  requirementsRef.current = requirements;

  if (
    prevDepsRef.current.normalizedDelay !== normalizedDelay ||
    prevDepsRef.current.requirementKey !== requirementKey ||
    prevDepsRef.current.strategy !== strategy
  ) {
    prevDepsRef.current = { normalizedDelay, requirementKey, strategy };
    readyCallbackFiredRef.current = false;
    unsupportedCallbackKeyRef.current = null;
  }

  useEffect(() => {
    let active = true;
    let strategyCleanup: Cleanup | null = null;
    let delayCleanup: Cleanup | null = null;

    const updateState = (nextState: ClientOnlyState) => {
      if (!active) {
        return;
      }

      setState((currentState) => {
        if (
          currentState.isClient === nextState.isClient &&
          currentState.isReady === nextState.isReady &&
          currentState.isSupported === nextState.isSupported &&
          areMissingFeaturesEqual(currentState.missingFeatures, nextState.missingFeatures)
        ) {
          return currentState;
        }

        return nextState;
      });
    };

    const markReady = () => {
      if (!active) {
        return;
      }

      updateState({
        isClient: true,
        isReady: true,
        isSupported: true,
        missingFeatures: [],
      });

      if (!readyCallbackFiredRef.current) {
        readyCallbackFiredRef.current = true;
        callbacksRef.current.onReady?.();
      }
    };

    try {
      const missingFeatures = detectMissingClientFeatures(requirementsRef.current);

      if (missingFeatures.length > 0) {
        updateState({
          isClient: true,
          isReady: false,
          isSupported: false,
          missingFeatures,
        });

        const unsupportedCallbackKey = missingFeatures.join("|");

        if (unsupportedCallbackKeyRef.current !== unsupportedCallbackKey) {
          unsupportedCallbackKeyRef.current = unsupportedCallbackKey;
          callbacksRef.current.onUnsupported?.(missingFeatures);
        }

        return () => {
          active = false;
        };
      }

      updateState({
        isClient: true,
        isReady: false,
        isSupported: true,
        missingFeatures: [],
      });

      strategyCleanup = scheduleWithStrategy(strategy, () => {
        if (!active) {
          return;
        }

        if (normalizedDelay > 0) {
          const handle = setTimeout(markReady, normalizedDelay);
          delayCleanup = () => {
            clearTimeout(handle);
          };
          return;
        }

        markReady();
      });
    } catch (error) {
      callbacksRef.current.onError?.(error);
      updateState({
        isClient: true,
        isReady: false,
        isSupported: false,
        missingFeatures: [],
      });
    }

    return () => {
      active = false;
      delayCleanup?.();
      strategyCleanup?.();
    };
  }, [normalizedDelay, requirementKey, strategy]);

  const unsupportedNode = useMemo(() => {
    if (state.isSupported) {
      return null;
    }

    if (typeof unsupportedFallback === "function") {
      return unsupportedFallback(state.missingFeatures);
    }

    return unsupportedFallback ?? fallback;
  }, [fallback, state.isSupported, state.missingFeatures, unsupportedFallback]);

  if (!state.isClient) {
    return withHydrationWarning(fallback, suppressHydrationWarning);
  }

  if (!state.isSupported) {
    return withHydrationWarning(unsupportedNode, suppressHydrationWarning);
  }

  if (typeof children === "function") {
    return withHydrationWarning(renderChildren(children, state), suppressHydrationWarning);
  }

  if (!state.isReady) {
    return withHydrationWarning(fallback, suppressHydrationWarning);
  }

  return withHydrationWarning(renderChildren(children, state), suppressHydrationWarning);
}

ClientOnly.displayName = "ClientOnly";
