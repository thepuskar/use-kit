import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useTimeout } from "../src/client/hooks";

describe("useTimeout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts automatically by default and runs the callback after the delay", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useTimeout(callback, 1000));

    expect(result.current.isPending).toBe(true);

    act(() => {
      vi.advanceTimersByTime(999);
    });

    expect(callback).not.toHaveBeenCalled();
    expect(result.current.isPending).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.isPending).toBe(false);
  });

  it("can be cleared before the timeout fires", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useTimeout(callback, 1000));

    act(() => {
      result.current.clear();
      vi.advanceTimersByTime(1000);
    });

    expect(callback).not.toHaveBeenCalled();
    expect(result.current.isPending).toBe(false);
  });

  it("supports manual start when autoStart is disabled", () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useTimeout(callback, 500, {
        autoStart: false,
      }),
    );

    expect(result.current.isPending).toBe(false);

    act(() => {
      result.current.start();
    });

    expect(result.current.isPending).toBe(true);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.isPending).toBe(false);
  });

  it("reset restarts the active timeout from now", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useTimeout(callback, 1000));

    act(() => {
      vi.advanceTimersByTime(600);
      result.current.reset();
      vi.advanceTimersByTime(600);
    });

    expect(callback).not.toHaveBeenCalled();
    expect(result.current.isPending).toBe(true);

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.isPending).toBe(false);
  });

  it("uses the latest callback without rescheduling on callback changes", () => {
    const firstCallback = vi.fn();
    const nextCallback = vi.fn();

    const { rerender } = renderHook(({ callback }) => useTimeout(callback, 1000), {
      initialProps: {
        callback: firstCallback,
      },
    });

    rerender({
      callback: nextCallback,
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(firstCallback).not.toHaveBeenCalled();
    expect(nextCallback).toHaveBeenCalledTimes(1);
  });

  it("does not schedule when delay is null", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useTimeout(callback, null));

    expect(result.current.isPending).toBe(false);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
