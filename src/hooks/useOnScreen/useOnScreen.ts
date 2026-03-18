import { RefObject } from "react";

import {
  useIntersectionObserver,
  UseIntersectionObserverOptions,
} from "../useIntersectionObserver";

export interface UseOnScreenOptions<T extends Element = HTMLElement> extends Omit<
  UseIntersectionObserverOptions<T>,
  "ref" | "onChange" | "initialIsIntersecting"
> {
  /**
   * Friendly alias for freezing after the first visible intersection.
   */
  once?: boolean;

  /**
   * Initial boolean value before the observer reports its first entry.
   */
  initialIsVisible?: boolean;
}

/**
 * Observe a target element and return only a boolean visibility state.
 *
 * Use this when you already have a ref and only care about whether the
 * element is currently on screen.
 */
export function useOnScreen<T extends Element = HTMLElement>(
  ref: RefObject<T | null>,
  options: UseOnScreenOptions<T> = {},
): boolean {
  const { once = false, freezeOnceVisible, initialIsVisible = false, ...observerOptions } = options;

  return useIntersectionObserver<T>({
    ref,
    ...observerOptions,
    freezeOnceVisible: freezeOnceVisible ?? once,
    initialIsIntersecting: initialIsVisible,
  }).isIntersecting;
}
