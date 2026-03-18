import { useEffect, useRef, useState } from "react";

export type ThrottleDelay = number | null | undefined;

export interface UseThrottleOptions<T> {
  leading?: boolean;
  trailing?: boolean;
  equalityFn?: (previousValue: T, nextValue: T) => boolean;
}

const defaultEqualityFn = <T>(previousValue: T, nextValue: T) =>
  Object.is(previousValue, nextValue);

/**
 * Return a throttled value that updates at most once per throttle window.
 */
export function useThrottle<T>(
  value: T,
  delay: ThrottleDelay = 5000,
  options: UseThrottleOptions<T> = {},
): T {
  const { leading = true, trailing = true, equalityFn = defaultEqualityFn } = options;

  const [throttledValue, setThrottledValue] = useState<T>(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousValueRef = useRef(value);
  const previousDelayRef = useRef(delay);
  const previousLeadingRef = useRef(leading);
  const previousTrailingRef = useRef(trailing);
  const pendingValueRef = useRef(value);
  const lastExecutionTimeRef = useRef<number | null>(null);
  const pendingStartTimeRef = useRef<number | null>(null);

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
    pendingValueRef.current = value;

    const clearScheduledUpdate = () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const emitValue = (nextValue: T) => {
      setThrottledValue(nextValue);
      lastExecutionTimeRef.current = Date.now();
      pendingStartTimeRef.current = null;
    };

    const scheduleTrailingUpdate = (wait: number) => {
      clearScheduledUpdate();

      if (!trailing) {
        pendingStartTimeRef.current = null;
        return;
      }

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        emitValue(pendingValueRef.current);
      }, wait);
    };

    if (!valueChanged && !hasActiveTimer) {
      return;
    }

    if (delay === null || delay === undefined) {
      clearScheduledUpdate();
      emitValue(value);
      return;
    }

    const normalizedDelay = Math.max(0, delay);

    if (!leading && !trailing) {
      clearScheduledUpdate();
      pendingStartTimeRef.current = null;
      return;
    }

    const now = Date.now();

    if (hasActiveTimer) {
      const activeWindowStart = pendingStartTimeRef.current ?? lastExecutionTimeRef.current ?? now;
      const remaining = Math.max(0, normalizedDelay - (now - activeWindowStart));

      if (configChanged) {
        if (remaining === 0) {
          emitValue(pendingValueRef.current);
          return;
        }

        scheduleTrailingUpdate(remaining);
      }

      return;
    }

    const lastExecutionTime = lastExecutionTimeRef.current;

    if (lastExecutionTime === null) {
      if (leading) {
        emitValue(value);
        return;
      }

      pendingStartTimeRef.current = now;
      scheduleTrailingUpdate(normalizedDelay);
      return;
    }

    const remaining = normalizedDelay - (now - lastExecutionTime);

    if (remaining <= 0) {
      if (leading) {
        emitValue(value);
        return;
      }

      pendingStartTimeRef.current = now;
      scheduleTrailingUpdate(normalizedDelay);
      return;
    }

    pendingStartTimeRef.current = lastExecutionTime;
    scheduleTrailingUpdate(remaining);
  }, [delay, equalityFn, leading, trailing, value]);

  return throttledValue;
}
