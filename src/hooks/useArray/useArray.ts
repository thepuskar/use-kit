import { Dispatch, SetStateAction, useCallback, useRef, useState } from "react";

export type ArrayInitialValue<T> = T[] | (() => T[]);
export type ArrayItemUpdater<T> = T | ((currentValue: T) => T);

export interface UseArrayReturn<T> {
  value: T[];
  length: number;
  isEmpty: boolean;
  setValue: Dispatch<SetStateAction<T[]>>;
  push: (...items: T[]) => void;
  filter: (predicate: (item: T, index: number, array: T[]) => boolean) => void;
  removeAt: (index: number) => void;
  removeValue: (item: T) => void;
  update: (index: number, nextValue: ArrayItemUpdater<T>) => void;
  move: (fromIndex: number, toIndex: number) => void;
  clear: () => void;
  reset: () => void;
  shuffle: () => void;
}

function cloneArray<T>(array: T[]): T[] {
  return array.slice();
}

function resolveInitialValue<T>(initialValue: ArrayInitialValue<T>): T[] {
  if (typeof initialValue === "function") {
    return cloneArray((initialValue as () => T[])());
  }

  return cloneArray(initialValue);
}

function normalizeIndex(length: number, index: number): number {
  if (length === 0) {
    return -1;
  }

  const normalizedIndex = index < 0 ? length + index : index;

  if (normalizedIndex < 0 || normalizedIndex >= length) {
    return -1;
  }

  return normalizedIndex;
}

function clampIndex(length: number, index: number): number {
  if (length === 0) {
    return -1;
  }

  const normalizedIndex = index < 0 ? length + index : index;
  return Math.min(Math.max(normalizedIndex, 0), length - 1);
}

/**
 * Manage array state with immutable helpers for common collection updates.
 */
export function useArray<T>(initialValue: ArrayInitialValue<T> = [] as T[]): UseArrayReturn<T> {
  const [value, setValue] = useState<T[]>(() => resolveInitialValue(initialValue));
  const initialValueRef = useRef<T[]>(cloneArray(value));

  const push = useCallback((...items: T[]) => {
    if (items.length === 0) {
      return;
    }

    setValue((currentValue) => [...currentValue, ...items]);
  }, []);

  const filter = useCallback((predicate: (item: T, index: number, array: T[]) => boolean) => {
    setValue((currentValue) => currentValue.filter(predicate));
  }, []);

  const removeAt = useCallback((index: number) => {
    setValue((currentValue) => {
      const normalizedIndex = normalizeIndex(currentValue.length, index);

      if (normalizedIndex === -1) {
        return currentValue;
      }

      return [
        ...currentValue.slice(0, normalizedIndex),
        ...currentValue.slice(normalizedIndex + 1),
      ];
    });
  }, []);

  const removeValue = useCallback((item: T) => {
    setValue((currentValue) => currentValue.filter((currentItem) => !Object.is(currentItem, item)));
  }, []);

  const update = useCallback((index: number, nextValue: ArrayItemUpdater<T>) => {
    setValue((currentValue) => {
      const normalizedIndex = normalizeIndex(currentValue.length, index);

      if (normalizedIndex === -1) {
        return currentValue;
      }

      const resolvedValue =
        typeof nextValue === "function"
          ? (nextValue as (currentItem: T) => T)(currentValue[normalizedIndex])
          : nextValue;

      if (Object.is(currentValue[normalizedIndex], resolvedValue)) {
        return currentValue;
      }

      const nextArray = cloneArray(currentValue);
      nextArray[normalizedIndex] = resolvedValue;
      return nextArray;
    });
  }, []);

  const move = useCallback((fromIndex: number, toIndex: number) => {
    setValue((currentValue) => {
      if (currentValue.length <= 1) {
        return currentValue;
      }

      const normalizedFromIndex = normalizeIndex(currentValue.length, fromIndex);
      const normalizedToIndex = clampIndex(currentValue.length, toIndex);

      if (
        normalizedFromIndex === -1 ||
        normalizedToIndex === -1 ||
        normalizedFromIndex === normalizedToIndex
      ) {
        return currentValue;
      }

      const nextArray = cloneArray(currentValue);
      const [movedItem] = nextArray.splice(normalizedFromIndex, 1);
      nextArray.splice(normalizedToIndex, 0, movedItem);
      return nextArray;
    });
  }, []);

  const clear = useCallback(() => {
    setValue((currentValue) => (currentValue.length === 0 ? currentValue : []));
  }, []);

  const reset = useCallback(() => {
    setValue(cloneArray(initialValueRef.current));
  }, []);

  const shuffle = useCallback(() => {
    setValue((currentValue) => {
      if (currentValue.length <= 1) {
        return currentValue;
      }

      const nextArray = cloneArray(currentValue);

      for (let index = nextArray.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [nextArray[index], nextArray[randomIndex]] = [nextArray[randomIndex], nextArray[index]];
      }

      return nextArray;
    });
  }, []);

  return {
    value,
    length: value.length,
    isEmpty: value.length === 0,
    setValue,
    push,
    filter,
    removeAt,
    removeValue,
    update,
    move,
    clear,
    reset,
    shuffle,
  };
}
