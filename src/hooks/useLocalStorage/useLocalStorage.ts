import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

export type LocalStorageInitialValue<T> = T | (() => T);

export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: Dispatch<SetStateAction<T>>;
  remove: () => void;
  reset: () => void;
  isSupported: boolean;
}

interface StoredValueEnvelope {
  __useKitLocalStorage: true;
  kind?: "undefined";
  value?: unknown;
}

const emptySubscribe = () => () => undefined;

function resolveInitialValue<T>(initialValue: LocalStorageInitialValue<T>): T {
  return typeof initialValue === "function" ? (initialValue as () => T)() : initialValue;
}

function isStoredValueEnvelope(value: unknown): value is StoredValueEnvelope {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as Record<string, unknown>).__useKitLocalStorage === true
  );
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

function serializeStoredValue(value: unknown): string {
  if (value === undefined) {
    return JSON.stringify({
      __useKitLocalStorage: true,
      kind: "undefined",
    } satisfies StoredValueEnvelope);
  }

  return JSON.stringify({
    __useKitLocalStorage: true,
    value,
  } satisfies StoredValueEnvelope);
}

function deserializeStoredValue<T>(
  storedValue: string,
  initialValue: LocalStorageInitialValue<T>,
): T {
  try {
    const parsedValue = JSON.parse(storedValue) as unknown;

    if (!isStoredValueEnvelope(parsedValue)) {
      return parsedValue as T;
    }

    if (parsedValue.kind === "undefined") {
      return undefined as T;
    }

    if ("value" in parsedValue) {
      return parsedValue.value as T;
    }
  } catch {
    // Ignore malformed JSON and fall back to the initial value.
  }

  return resolveInitialValue(initialValue);
}

function readStoredValue<T>(key: string, initialValue: LocalStorageInitialValue<T>): T {
  const storage = getStorage();

  if (storage === null) {
    return resolveInitialValue(initialValue);
  }

  try {
    const storedValue = storage.getItem(key);
    return storedValue === null
      ? resolveInitialValue(initialValue)
      : deserializeStoredValue(storedValue, initialValue);
  } catch {
    return resolveInitialValue(initialValue);
  }
}

function writeStoredValue<T>(key: string, value: T): void {
  const storage = getStorage();

  if (storage === null) {
    return;
  }

  try {
    storage.setItem(key, serializeStoredValue(value));
  } catch {
    // Ignore storage write failures and keep React state usable.
  }
}

function removeStoredValue(key: string): void {
  const storage = getStorage();

  if (storage === null) {
    return;
  }

  try {
    storage.removeItem(key);
  } catch {
    // Ignore storage removal failures and keep React state usable.
  }
}

/**
 * Persist state in localStorage with JSON-safe serialization and reset helpers.
 *
 * Initializes from `initialValue` on the server and during hydration, then syncs from
 * localStorage after mount to avoid hydration mismatches. `isSupported` is also SSR-safe.
 *
 * `remove`/`reset` use the latest `initialValue` for a given `key`; `setValue` skips storage
 * when the value is unchanged (`Object.is`).
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: LocalStorageInitialValue<T>,
): UseLocalStorageReturn<T> {
  const previousKeyRef = useRef(key);
  const initialValueRef = useRef(initialValue);
  initialValueRef.current = initialValue;

  const [value, setStoredValue] = useState<T>(() => resolveInitialValue(initialValue));

  const isSupported = useSyncExternalStore(
    emptySubscribe,
    () => getStorage() !== null,
    () => false,
  );

  useEffect(() => {
    if (previousKeyRef.current !== key) {
      previousKeyRef.current = key;
      setStoredValue(readStoredValue(key, initialValueRef.current));
      return;
    }

    const storage = getStorage();
    if (storage === null) {
      return;
    }

    try {
      const storedValue = storage.getItem(key);
      if (storedValue === null) {
        return;
      }

      setStoredValue(deserializeStoredValue(storedValue, initialValueRef.current));
    } catch {
      // Keep the hydrated initial value when storage reads fail.
    }
  }, [key]);

  const setValue = useCallback<Dispatch<SetStateAction<T>>>(
    (nextValue) => {
      setStoredValue((currentValue) => {
        const resolvedValue =
          typeof nextValue === "function"
            ? (nextValue as (previousValue: T) => T)(currentValue)
            : nextValue;

        if (Object.is(resolvedValue, currentValue)) {
          return currentValue;
        }

        writeStoredValue(key, resolvedValue);
        return resolvedValue;
      });
    },
    [key],
  );

  const remove = useCallback(() => {
    const fallbackValue = resolveInitialValue(initialValueRef.current);

    removeStoredValue(key);
    setStoredValue(fallbackValue);
  }, [key]);

  const reset = useCallback(() => {
    const fallbackValue = resolveInitialValue(initialValueRef.current);

    writeStoredValue(key, fallbackValue);
    setStoredValue(fallbackValue);
  }, [key]);

  return {
    value,
    setValue,
    remove,
    reset,
    isSupported,
  };
}
