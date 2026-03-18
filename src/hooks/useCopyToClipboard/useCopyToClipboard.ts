import { useCallback, useEffect, useRef, useState } from "react";

export type CopyToClipboardStatus = "idle" | "success" | "error";

export interface CopyToClipboardOptions {
  /**
   * Time in milliseconds before `copied` resets back to `false`.
   * Use `null` to keep the success state until `reset()` is called.
   */
  resetTime?: number | null;

  /**
   * Callback invoked after a successful copy.
   */
  onSuccess?: (copiedText: string) => void;

  /**
   * Callback invoked when copying fails.
   */
  onError?: (error: Error) => void;

  /**
   * Skip the `document.execCommand("copy")` fallback and require the Clipboard API.
   */
  disableFallback?: boolean;
}

export interface CopyToClipboardState {
  copied: boolean;
  copiedText: string | null;
  error: Error | null;
  status: CopyToClipboardStatus;
  isSupported: boolean;
}

export interface UseCopyToClipboardResult extends CopyToClipboardState {
  copy: (text: string) => Promise<void>;
  reset: () => void;
}

function canUseClipboardApi(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.clipboard !== "undefined" &&
    typeof navigator.clipboard.writeText === "function"
  );
}

function canUseExecCommandFallback(): boolean {
  return typeof document !== "undefined" && typeof document.execCommand === "function";
}

function isClipboardSupported(disableFallback: boolean): boolean {
  return canUseClipboardApi() || (!disableFallback && canUseExecCommandFallback());
}

function copyWithExecCommandFallback(text: string): boolean {
  if (typeof document === "undefined") {
    return false;
  }

  const container = document.body ?? document.documentElement;

  if (!container) {
    return false;
  }

  const activeElement =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const selection = document.getSelection();
  const originalRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  textArea.style.pointerEvents = "none";
  textArea.style.left = "-9999px";
  textArea.style.top = "0";

  container.appendChild(textArea);
  textArea.focus();
  textArea.select();
  textArea.setSelectionRange(0, text.length);

  try {
    return document.execCommand("copy");
  } finally {
    container.removeChild(textArea);

    if (selection) {
      selection.removeAllRanges();

      if (originalRange) {
        selection.addRange(originalRange);
      }
    }

    activeElement?.focus();
  }
}

/**
 * Copy text to the clipboard with success state, error handling, and optional fallback support.
 */
export function useCopyToClipboard(options: CopyToClipboardOptions = {}): UseCopyToClipboardResult {
  const { resetTime = 1500, onSuccess, onError, disableFallback = false } = options;

  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [state, setState] = useState<Omit<CopyToClipboardState, "isSupported">>({
    copied: false,
    copiedText: null,
    error: null,
    status: "idle",
  });

  const isSupported = isClipboardSupported(disableFallback);

  const clearResetTimeout = useCallback(() => {
    if (resetTimeoutRef.current !== null) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    return clearResetTimeout;
  }, [clearResetTimeout]);

  const reset = useCallback(() => {
    clearResetTimeout();
    setState({
      copied: false,
      copiedText: null,
      error: null,
      status: "idle",
    });
  }, [clearResetTimeout]);

  const copy = useCallback(
    async (text: string) => {
      clearResetTimeout();

      try {
        if (canUseClipboardApi()) {
          await navigator.clipboard.writeText(text);
        } else if (!disableFallback && canUseExecCommandFallback()) {
          const didCopy = copyWithExecCommandFallback(text);

          if (!didCopy) {
            throw new Error("Failed to copy");
          }
        } else {
          throw new Error("Clipboard API not supported");
        }

        setState({
          copied: true,
          copiedText: text,
          error: null,
          status: "success",
        });

        onSuccessRef.current?.(text);

        if (typeof resetTime === "number" && resetTime >= 0) {
          resetTimeoutRef.current = setTimeout(() => {
            setState((currentState) => ({
              ...currentState,
              copied: false,
              error: null,
              status: "idle",
            }));
            resetTimeoutRef.current = null;
          }, resetTime);
        }
      } catch (error) {
        const copyError = error instanceof Error ? error : new Error("Failed to copy");

        setState((currentState) => ({
          ...currentState,
          copied: false,
          error: copyError,
          status: "error",
        }));

        onErrorRef.current?.(copyError);
      }
    },
    [clearResetTimeout, disableFallback, resetTime],
  );

  return {
    ...state,
    isSupported,
    copy,
    reset,
  };
}
