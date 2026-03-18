import { useEffect, useRef, useState } from "react";

export type DebounceDelay = number | null | undefined;

export interface UseDebounceOptions<T> {
  leading?: boolean;
  trailing?: boolean;
  equalityFn?: (previousValue: T, nextValue: T) => boolean;
}

const defaultEqualityFn = <T>(previousValue: T, nextValue: T) =>
  Object.is(previousValue, nextValue);

/**
 * Return a debounced value with optional leading/trailing control.
 */
export function useDebounce<T>(
  value: T,
  delay: DebounceDelay = 500,
  options: UseDebounceOptions<T> = {},
): T {
  const { leading = false, trailing = true, equalityFn = defaultEqualityFn } = options;

  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousValueRef = useRef(value);
  const previousDelayRef = useRef(delay);
  const previousLeadingRef = useRef(leading);
  const previousTrailingRef = useRef(trailing);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const previousValue = previousValueRef.current;
    const previousDelay = previousDelayRef.current;
    const previousLeading = previousLeadingRef.current;
    const previousTrailing = previousTrailingRef.current;
    const hasActiveTimer = timeoutRef.current !== null;
    const valueChanged = !equalityFn(previousValue, value);
    const configChanged =
      previousDelay !== delay || previousLeading !== leading || previousTrailing !== trailing;

    if (!valueChanged && !configChanged) {
      return;
    }

    previousValueRef.current = value;
    previousDelayRef.current = delay;
    previousLeadingRef.current = leading;
    previousTrailingRef.current = trailing;

    if (!valueChanged && !hasActiveTimer) {
      return;
    }

    if (hasActiveTimer && timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (delay === null || delay === undefined) {
      setDebouncedValue(value);
      return;
    }

    const normalizedDelay = Math.max(0, delay);
    const shouldCallLeading = valueChanged && leading && !hasActiveTimer;

    if (shouldCallLeading) {
      setDebouncedValue(value);
    }

    if (!leading && !trailing) {
      return;
    }

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;

      if (trailing) {
        setDebouncedValue(value);
      }
    }, normalizedDelay);
  }, [delay, equalityFn, leading, trailing, value]);

  return debouncedValue;
}
