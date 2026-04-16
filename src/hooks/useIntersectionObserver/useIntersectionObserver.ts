import { RefCallback, RefObject, useCallback, useRef, useState } from "react";

import { useIsomorphicEffect } from "../useIsomorphicEffect";

const DEFAULT_ROOT_MARGIN = "0px";
const DEFAULT_THRESHOLD = 0;

type ObserverRoot = NonNullable<IntersectionObserverInit["root"]>;
type MaybeRef<T> = T | RefObject<T | null> | null;

export interface UseIntersectionObserverOptions<T extends Element = Element> extends Omit<
  IntersectionObserverInit,
  "root"
> {
  /**
   * Optional external ref. If omitted, use the returned `ref` callback.
   */
  ref?: RefObject<T | null> | null;

  /**
   * Root element or a ref pointing to the root element.
   */
  root?: MaybeRef<ObserverRoot>;

  /**
   * Stop observing after the first visible intersection.
   * `freezeOnceVisible` is the preferred name; `triggerOnce` is kept for compatibility.
   */
  freezeOnceVisible?: boolean;
  triggerOnce?: boolean;

  /**
   * Disable observation without unmounting the hook.
   */
  disabled?: boolean;

  /**
   * Initial value used before the observer reports its first entry.
   */
  initialIsIntersecting?: boolean;

  /**
   * Fallback value when IntersectionObserver is not available.
   */
  fallbackInView?: boolean;

  /**
   * Optional callback invoked on every observer update.
   */
  onChange?: (entry: IntersectionObserverEntry, observer: IntersectionObserver) => void;
}

export interface UseIntersectionObserverResult<T extends Element = Element> {
  /**
   * Callback ref for the target node. Ignore this when passing an external `ref`.
   */
  ref: RefCallback<T>;

  /**
   * The latest observer entry for the target, if one exists.
   */
  entry: IntersectionObserverEntry | null;

  /**
   * Whether the target is currently intersecting.
   */
  isIntersecting: boolean;

  /**
   * Whether the target has intersected at least once during this observation cycle.
   */
  hasIntersected: boolean;

  /**
   * Latest intersection ratio. Returns `0` until an entry is available.
   */
  intersectionRatio: number;

  /**
   * Latest bounding client rect from the observer entry.
   */
  boundingClientRect: DOMRectReadOnly | null;

  /**
   * Latest intersection rect from the observer entry.
   */
  intersectionRect: DOMRectReadOnly | null;

  /**
   * Latest root bounds from the observer entry.
   */
  rootBounds: DOMRectReadOnly | null;

  /**
   * Timestamp from the latest observer entry.
   */
  time: number;

  /**
   * The current target being observed.
   */
  target: T | null;

  /**
   * Whether `IntersectionObserver` is available in the current environment.
   */
  isSupported: boolean;

  /**
   * Manually disconnect the active observer.
   */
  disconnect: () => void;
}

function isRefObject<T>(value: MaybeRef<T>): value is RefObject<T | null> {
  return typeof value === "object" && value !== null && "current" in value;
}

function resolveMaybeRef<T>(value: MaybeRef<T> | undefined): T | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (isRefObject(value)) {
    return value.current;
  }

  return value;
}

function serializeThreshold(threshold: number | number[]): string {
  return Array.isArray(threshold) ? threshold.join(",") : String(threshold);
}

/**
 * Observe an element with the Intersection Observer API.
 *
 * Supports both an external `ref` and an internally managed callback ref, exposes
 * useful derived state, and handles observer cleanup safely.
 */
export function useIntersectionObserver<T extends Element = Element>({
  ref: externalRef,
  root = null,
  rootMargin = DEFAULT_ROOT_MARGIN,
  threshold = DEFAULT_THRESHOLD,
  freezeOnceVisible = false,
  triggerOnce = false,
  disabled = false,
  initialIsIntersecting = false,
  fallbackInView,
  onChange,
}: UseIntersectionObserverOptions<T> = {}): UseIntersectionObserverResult<T> {
  const initialInView = fallbackInView ?? initialIsIntersecting;
  const isSupported =
    typeof window !== "undefined" && typeof window.IntersectionObserver !== "undefined";

  const observerRef = useRef<IntersectionObserver | null>(null);
  const onChangeRef = useRef(onChange);
  const previousNodeRef = useRef<T | null>(null);

  const [target, setTarget] = useState<T | null>(externalRef?.current ?? null);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(initialInView);
  const [hasIntersected, setHasIntersected] = useState(initialInView);

  const freeze = freezeOnceVisible || triggerOnce;
  const rootNode: IntersectionObserverInit["root"] = resolveMaybeRef<ObserverRoot>(root);
  const thresholdKey = serializeThreshold(threshold);

  const disconnect = useCallback(() => {
    observerRef.current?.disconnect();
    observerRef.current = null;
  }, []);

  const ref = useCallback<RefCallback<T>>((node) => {
    setTarget(node);
  }, []);

  useIsomorphicEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useIsomorphicEffect(() => {
    if (externalRef?.current !== undefined && externalRef.current !== target) {
      setTarget(externalRef.current);
    }
  }, [externalRef, target]);

  useIsomorphicEffect(() => {
    const currentNode = externalRef?.current ?? target;

    if (previousNodeRef.current !== currentNode) {
      previousNodeRef.current = currentNode;
      setEntry(null);
      setIsIntersecting(initialInView);
      setHasIntersected(initialInView);
    }
  }, [externalRef, initialInView, target]);

  useIsomorphicEffect(() => {
    const node = externalRef?.current ?? target;

    if (!isSupported || disabled || !node || (freeze && hasIntersected)) {
      disconnect();
      return;
    }

    const observer = new window.IntersectionObserver(
      ([nextEntry]) => {
        setEntry(nextEntry);
        setIsIntersecting(nextEntry.isIntersecting);

        if (nextEntry.isIntersecting) {
          setHasIntersected(true);
        }

        onChangeRef.current?.(nextEntry, observer);

        if (freeze && nextEntry.isIntersecting) {
          observer.disconnect();
          observerRef.current = null;
        }
      },
      {
        root: rootNode,
        rootMargin,
        threshold,
      },
    );

    observerRef.current = observer;
    observer.observe(node);

    return disconnect;
  }, [
    disconnect,
    disabled,
    externalRef,
    freeze,
    hasIntersected,
    isSupported,
    rootMargin,
    rootNode,
    target,
    thresholdKey,
  ]);

  return {
    ref,
    entry,
    isIntersecting,
    hasIntersected,
    intersectionRatio: entry?.intersectionRatio ?? 0,
    boundingClientRect: entry?.boundingClientRect ?? null,
    intersectionRect: entry?.intersectionRect ?? null,
    rootBounds: entry?.rootBounds ?? null,
    time: entry?.time ?? 0,
    target,
    isSupported,
    disconnect,
  };
}
