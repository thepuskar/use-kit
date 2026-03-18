import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useThrottle } from "../src/client/hooks";

describe("useThrottle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the initial value immediately", () => {
    const { result } = renderHook(({ value }) => useThrottle(value, 300), {
      initialProps: { value: "react" },
    });

    expect(result.current).toBe("react");
  });

  it("updates immediately on the first change by default", () => {
    const { result, rerender } = renderHook(({ value }) => useThrottle(value, 300), {
      initialProps: { value: "a" },
    });

    rerender({ value: "ab" });

    expect(result.current).toBe("ab");
  });

  it("keeps the throttle window and applies the latest trailing value", () => {
    const { result, rerender } = renderHook(({ value }) => useThrottle(value, 300), {
      initialProps: { value: "a" },
    });

    rerender({ value: "ab" });
    expect(result.current).toBe("ab");

    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: "abc" });
    expect(result.current).toBe("ab");

    act(() => {
      vi.advanceTimersByTime(199);
    });

    expect(result.current).toBe("ab");

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe("abc");
  });

  it("does not reset the first delayed window when leading is false", () => {
    const { result, rerender } = renderHook(
      ({ value }) =>
        useThrottle(value, 300, {
          leading: false,
        }),
      {
        initialProps: { value: "a" },
      },
    );

    rerender({ value: "ab" });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: "abc" });

    act(() => {
      vi.advanceTimersByTime(199);
    });

    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe("abc");
  });

  it("updates immediately when delay is null", () => {
    const { result, rerender } = renderHook(({ value }) => useThrottle(value, null), {
      initialProps: { value: "a" },
    });

    rerender({ value: "ab" });

    expect(result.current).toBe("ab");
  });

  it("flushes a pending value when throttling is disabled", () => {
    const { result, rerender } = renderHook(({ value, delay }) => useThrottle(value, delay), {
      initialProps: { value: "a", delay: 300 as number | null },
    });

    rerender({ value: "ab", delay: 300 });
    expect(result.current).toBe("ab");

    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: "abc", delay: 300 });
    expect(result.current).toBe("ab");

    rerender({ value: "abc", delay: null });
    expect(result.current).toBe("abc");
  });

  it("reschedules a pending update when the delay changes", () => {
    const { result, rerender } = renderHook(({ value, delay }) => useThrottle(value, delay), {
      initialProps: { value: "a", delay: 300 },
    });

    rerender({ value: "ab", delay: 300 });
    expect(result.current).toBe("ab");

    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: "abc", delay: 300 });

    act(() => {
      vi.advanceTimersByTime(50);
    });

    rerender({ value: "abc", delay: 600 });

    act(() => {
      vi.advanceTimersByTime(449);
    });

    expect(result.current).toBe("ab");

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe("abc");
  });

  it("supports custom equality checks", () => {
    const equalityFn = vi.fn(
      (previous: { q: string }, next: { q: string }) => previous.q === next.q,
    );

    const { result, rerender } = renderHook(
      ({ value }) =>
        useThrottle(value, 300, {
          equalityFn,
        }),
      {
        initialProps: { value: { q: "react" } },
      },
    );

    rerender({ value: { q: "react" } });
    expect(result.current.q).toBe("react");

    rerender({ value: { q: "hooks" } });
    expect(result.current.q).toBe("hooks");
    expect(equalityFn).toHaveBeenCalled();
  });
});
