import { MutableRefObject, useCallback, useRef, useState } from "react";

/**
 * Options for `useDisclosure`.
 */
export interface UseDisclosureOptions {
  /**
   * Controlled open state.
   * If this is not `undefined`, the hook is controlled.
   */
  open?: boolean;

  /**
   * Initial open state for uncontrolled mode.
   * Later changes are ignored.
   */
  defaultOpen?: boolean;

  /**
   * Called when the disclosure transitions from closed to open.
   */
  onOpen?: () => void;

  /**
   * Called when the disclosure transitions from open to closed.
   */
  onClose?: () => void;

  /**
   * Called when the disclosure open state changes.
   */
  onChange?: (open: boolean) => void;
}

/**
 * Return value for `useDisclosure`.
 */
export interface UseDisclosureReturn {
  /**
   * Current open state.
   */
  isOpen: boolean;

  /**
   * Opens the disclosure.
   */
  open: () => void;

  /**
   * Closes the disclosure.
   */
  close: () => void;

  /**
   * Toggles the disclosure.
   */
  toggle: () => void;

  /**
   * Sets the disclosure open state.
   */
  setOpen: (open: boolean) => void;
}

function useLatestRef<T>(value: T): MutableRefObject<T> {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

/**
 * Manage boolean disclosure state for UI that can be either controlled or uncontrolled.
 */
export function useDisclosure(options: UseDisclosureOptions = {}): UseDisclosureReturn {
  const { open: controlledOpen, defaultOpen = false, onOpen, onClose, onChange } = options;
  const isControlled = controlledOpen !== undefined;

  const [uncontrolledOpen, setUncontrolledOpen] = useState(() =>
    isControlled ? false : defaultOpen,
  );

  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;
  const isOpenRef = useLatestRef(isOpen);
  const isControlledRef = useLatestRef(isControlled);
  const onOpenRef = useLatestRef(onOpen);
  const onCloseRef = useLatestRef(onClose);
  const onChangeRef = useLatestRef(onChange);

  const setOpen = useCallback((nextOpen: boolean) => {
    const previousOpen = isOpenRef.current;

    if (Object.is(previousOpen, nextOpen)) {
      return;
    }

    isOpenRef.current = nextOpen;

    if (!isControlledRef.current) {
      setUncontrolledOpen(nextOpen);
    }

    if (nextOpen) {
      onOpenRef.current?.();
    } else {
      onCloseRef.current?.();
    }

    onChangeRef.current?.(nextOpen);
  }, []);

  const open = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const close = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const toggle = useCallback(() => {
    setOpen(!isOpenRef.current);
  }, [setOpen]);

  return {
    isOpen,
    open,
    close,
    toggle,
    setOpen,
  };
}
