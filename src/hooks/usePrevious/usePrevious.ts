import { useEffect, useRef } from "react";

export type PreviousEqualityFn<T> = (previousValue: T, nextValue: T) => boolean;
export type PreviousCloneFn<T> = (value: T) => T;

export interface UsePreviousOptions<T, TInitial = undefined> {
  initialValue?: TInitial;
  equalityFn?: PreviousEqualityFn<T>;
  clone?: PreviousCloneFn<T>;
  resetKeys?: readonly unknown[];
}

const EMPTY_RESET_KEYS: readonly unknown[] = [];

const defaultEqualityFn = <T>(previousValue: T, nextValue: T) =>
  Object.is(previousValue, nextValue);

function areResetKeysEqual(previousKeys: readonly unknown[] | null, nextKeys: readonly unknown[]) {
  if (previousKeys === null || previousKeys.length !== nextKeys.length) {
    return false;
  }

  return previousKeys.every((previousKey, index) => Object.is(previousKey, nextKeys[index]));
}

/**
 * Return the last committed value from the previous meaningful render.
 */
export function usePrevious<T, TInitial>(
  value: T,
  options: UsePreviousOptions<T, TInitial> & { initialValue: TInitial },
): T | TInitial;
export function usePrevious<T>(value: T, options?: UsePreviousOptions<T>): T | undefined;
export function usePrevious<T, TInitial = undefined>(
  value: T,
  options: UsePreviousOptions<T, TInitial> = {},
): T | TInitial | undefined {
  const {
    initialValue,
    equalityFn = defaultEqualityFn,
    clone,
    resetKeys = EMPTY_RESET_KEYS,
  } = options;

  const valueRef = useRef<T | undefined>(undefined);
  const hasValueRef = useRef(false);
  const resetKeysRef = useRef<readonly unknown[] | null>(null);
  const shouldReset = !areResetKeysEqual(resetKeysRef.current, resetKeys);
  const previousValue: T | TInitial | undefined =
    shouldReset || !hasValueRef.current ? initialValue : valueRef.current;

  useEffect(() => {
    const snapshot = clone ? clone(value) : value;

    if (shouldReset || !hasValueRef.current) {
      resetKeysRef.current = resetKeys.slice();
      valueRef.current = snapshot;
      hasValueRef.current = true;
      return;
    }

    if (!equalityFn(valueRef.current as T, value)) {
      valueRef.current = snapshot;
    }
  });

  return previousValue;
}
