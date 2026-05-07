import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * Options for `useControllableState`.
 */
export interface UseControllableStateOptions<T> {
  /**
   * Controlled value.
   * If this is not `undefined`, the hook is controlled.
   */
  value?: T;

  /**
   * Initial value for uncontrolled mode.
   * Supports either a direct value or a lazy initializer.
   */
  defaultValue?: T | (() => T);

  /**
   * Called whenever a value change is requested and accepted.
   */
  onChange?: (nextValue: T, previousValue: T) => void;

  /**
   * Optional component or state name used in development warnings.
   */
  name?: string;

  /**
   * Optional update predicate.
   * Return `true` when the update should be applied.
   * Defaults to applying updates only when `Object.is` reports a difference.
   */
  shouldUpdate?: (nextValue: T, previousValue: T) => boolean;
}

/**
 * Metadata returned by `useControllableState`.
 */
export interface UseControllableStateMeta {
  /**
   * Whether the hook is currently using the controlled `value`.
   */
  isControlled: boolean;
}

/**
 * Return tuple for `useControllableState`.
 */
export type UseControllableStateReturn<T> = [
  value: T | undefined,
  setValue: Dispatch<SetStateAction<T | undefined>>,
  meta: UseControllableStateMeta,
];

function resolveDefaultValue<T>(defaultValue: T | (() => T) | undefined): T | undefined {
  return typeof defaultValue === "function" ? (defaultValue as () => T)() : defaultValue;
}

function resolveNextValue<T>(
  nextValue: SetStateAction<T | undefined>,
  previousValue: T | undefined,
): T | undefined {
  return typeof nextValue === "function"
    ? (nextValue as (previousValue: T | undefined) => T | undefined)(previousValue)
    : nextValue;
}

function shouldApplyUpdate<T>(
  nextValue: T | undefined,
  previousValue: T | undefined,
  shouldUpdate: UseControllableStateOptions<T>["shouldUpdate"] | undefined,
): boolean {
  if (shouldUpdate) {
    return shouldUpdate(nextValue as T, previousValue as T);
  }

  return !Object.is(nextValue, previousValue);
}

function useLatestRef<T>(value: T): MutableRefObject<T> {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

function isDevelopmentEnvironment(): boolean {
  return typeof process !== "undefined" && process.env.NODE_ENV !== "production";
}

function getWarningName(name: string | undefined): string {
  return name ? ` for "${name}"` : "";
}

function getModeLabel(isControlled: boolean): "controlled" | "uncontrolled" {
  return isControlled ? "controlled" : "uncontrolled";
}

/**
 * Manage state that can be either controlled by a parent component or owned internally.
 *
 * Controlled mode is selected when `value !== undefined`. In controlled mode the returned value
 * always mirrors `value`, and the setter only requests changes through `onChange`. In uncontrolled
 * mode the hook initializes internal state from `defaultValue`, updates that internal state from
 * the setter, and still calls `onChange` for accepted changes.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
  name,
  shouldUpdate,
}: UseControllableStateOptions<T> = {}): UseControllableStateReturn<T> {
  const isControlled = value !== undefined;
  const hasDefaultValue = defaultValue !== undefined;

  const [uncontrolledValue, setUncontrolledValue] = useState<T | undefined>(() =>
    isControlled ? undefined : resolveDefaultValue(defaultValue),
  );

  const currentValue = isControlled ? value : uncontrolledValue;
  const currentValueRef = useLatestRef(currentValue);
  const isControlledRef = useLatestRef(isControlled);
  const onChangeRef = useLatestRef(onChange);
  const shouldUpdateRef = useLatestRef(shouldUpdate);

  const initialIsControlledRef = useRef(isControlled);
  const didWarnModeChangeRef = useRef(false);
  const didWarnMixedValueRef = useRef(false);

  useEffect(() => {
    if (!isDevelopmentEnvironment() || didWarnModeChangeRef.current) {
      return;
    }

    if (initialIsControlledRef.current !== isControlled) {
      const previousMode = getModeLabel(initialIsControlledRef.current);
      const nextMode = getModeLabel(isControlled);

      console.warn(
        `useControllableState${getWarningName(
          name,
        )} changed from ${previousMode} to ${nextMode}. Components should not switch between controlled and uncontrolled state after mount.`,
      );

      didWarnModeChangeRef.current = true;
    }
  }, [isControlled, name]);

  useEffect(() => {
    if (!isDevelopmentEnvironment() || didWarnMixedValueRef.current) {
      return;
    }

    if (isControlled && hasDefaultValue) {
      console.warn(
        `useControllableState${getWarningName(
          name,
        )} received both value and defaultValue. Choose either controlled or uncontrolled state for the component lifetime.`,
      );

      didWarnMixedValueRef.current = true;
    }
  }, [hasDefaultValue, isControlled, name]);

  const setValue = useCallback<Dispatch<SetStateAction<T | undefined>>>((nextValueOrUpdater) => {
    const previousValue = currentValueRef.current;
    const nextValue = resolveNextValue(nextValueOrUpdater, previousValue);

    if (!shouldApplyUpdate(nextValue, previousValue, shouldUpdateRef.current)) {
      return;
    }

    if (!isControlledRef.current) {
      currentValueRef.current = nextValue;
      setUncontrolledValue(nextValue);
    }

    onChangeRef.current?.(nextValue as T, previousValue as T);
  }, []);

  const meta = useMemo<UseControllableStateMeta>(
    () => ({
      isControlled,
    }),
    [isControlled],
  );

  return [currentValue, setValue, meta];
}
