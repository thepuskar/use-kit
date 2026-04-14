import { Dispatch, SetStateAction, useCallback, useRef, useState } from "react";

export type ToggleValue = boolean | (() => boolean);
export type ToggleHandler = (nextValue?: boolean) => void;

export interface UseToggleActions {
  setTrue: () => void;
  setFalse: () => void;
  reset: () => void;
}

export type UseToggleReturn = readonly [
  value: boolean,
  toggle: ToggleHandler,
  setValue: Dispatch<SetStateAction<boolean>>,
  actions: UseToggleActions,
];

export function useToggle(initialValue: ToggleValue = false): UseToggleReturn {
  const [value, setValue] = useState<boolean>(initialValue);
  const initialValueRef = useRef(value);

  const toggle = useCallback<ToggleHandler>((nextValue) => {
    setValue((currentValue) => (typeof nextValue === "boolean" ? nextValue : !currentValue));
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  const reset = useCallback(() => {
    setValue(initialValueRef.current);
  }, []);

  const actionsRef = useRef<UseToggleActions | undefined>(undefined);

  if (!actionsRef.current) {
    actionsRef.current = {
      setTrue,
      setFalse,
      reset,
    };
  }

  return [value, toggle, setValue, actionsRef.current];
}
