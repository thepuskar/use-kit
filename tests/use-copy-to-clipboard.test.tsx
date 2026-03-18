import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useCopyToClipboard } from "../src/client/hooks";

const originalClipboard = navigator.clipboard;
const originalExecCommand = document.execCommand;

describe("useCopyToClipboard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: originalClipboard,
    });

    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: originalExecCommand,
    });
  });

  it("copies with the Clipboard API and resets after the timeout", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText,
      },
    });

    const { result } = renderHook(() =>
      useCopyToClipboard({
        resetTime: 1000,
      }),
    );

    await act(async () => {
      await result.current.copy("https://use-kit.dev/invite");
    });

    expect(writeText).toHaveBeenCalledWith("https://use-kit.dev/invite");
    expect(result.current.copied).toBe(true);
    expect(result.current.copiedText).toBe("https://use-kit.dev/invite");
    expect(result.current.status).toBe("success");
    expect(result.current.error).toBeNull();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.copied).toBe(false);
    expect(result.current.status).toBe("idle");
    expect(result.current.copiedText).toBe("https://use-kit.dev/invite");
  });

  it("uses the execCommand fallback when the Clipboard API is unavailable", async () => {
    const execCommand = vi.fn(() => true);

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });

    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: execCommand,
    });

    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("fallback text");
    });

    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(result.current.copied).toBe(true);
    expect(result.current.status).toBe("success");
    expect(result.current.isSupported).toBe(true);
  });

  it("stores errors when copying fails", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("Permission denied"));
    const onError = vi.fn();

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText,
      },
    });

    const { result } = renderHook(() =>
      useCopyToClipboard({
        onError,
      }),
    );

    await act(async () => {
      await result.current.copy("secret");
    });

    expect(result.current.copied).toBe(false);
    expect(result.current.status).toBe("error");
    expect(result.current.error?.message).toBe("Permission denied");
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Permission denied",
      }),
    );
  });

  it("supports manual reset and latest callbacks", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const firstOnSuccess = vi.fn();
    const nextOnSuccess = vi.fn();

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText,
      },
    });

    const { result, rerender } = renderHook(
      ({ onSuccess }) =>
        useCopyToClipboard({
          onSuccess,
          resetTime: null,
        }),
      {
        initialProps: {
          onSuccess: firstOnSuccess,
        },
      },
    );

    rerender({
      onSuccess: nextOnSuccess,
    });

    await act(async () => {
      await result.current.copy("updated callback");
    });

    expect(firstOnSuccess).not.toHaveBeenCalled();
    expect(nextOnSuccess).toHaveBeenCalledWith("updated callback");
    expect(result.current.copied).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.copied).toBe(false);
    expect(result.current.copiedText).toBeNull();
    expect(result.current.status).toBe("idle");
    expect(result.current.error).toBeNull();
  });

  it("can report unsupported clipboard environments", () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });

    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: undefined,
    });

    const { result } = renderHook(() =>
      useCopyToClipboard({
        disableFallback: true,
      }),
    );

    expect(result.current.isSupported).toBe(false);
  });
});
