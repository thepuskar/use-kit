import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDebounce } from "../src/client/hooks";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the initial value immediately", () => {
    const { result } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "react" },
    });

    expect(result.current).toBe("react");
  });

  it("updates after the debounce delay", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "react" },
    });

    rerender({ value: "react hooks" });

    expect(result.current).toBe("react");

    act(() => {
      vi.advanceTimersByTime(299);
    });

    expect(result.current).toBe("react");

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe("react hooks");
  });

  it("resets the timer when the value changes quickly", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "r" },
    });

    rerender({ value: "re" });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: "react" });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe("r");

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe("react");
  });

  it("updates immediately when delay is null", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, null), {
      initialProps: { value: "a" },
    });

    rerender({ value: "b" });

    expect(result.current).toBe("b");
  });

  it("resets the pending window when the delay changes", () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: "a", delay: 300 },
    });

    rerender({ value: "ab", delay: 300 });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: "ab", delay: 600 });

    act(() => {
      vi.advanceTimersByTime(599);
    });

    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe("ab");
  });

  it("flushes a pending value when debouncing is disabled", () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: "a", delay: 300 as number | null },
    });

    rerender({ value: "ab", delay: 300 });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: "ab", delay: null });

    expect(result.current).toBe("ab");
  });

  it("supports leading updates", () => {
    const { result, rerender } = renderHook(
      ({ value }) =>
        useDebounce(value, 300, {
          leading: true,
          trailing: false,
        }),
      {
        initialProps: { value: "a" },
      },
    );

    rerender({ value: "ab" });

    expect(result.current).toBe("ab");

    rerender({ value: "abc" });

    expect(result.current).toBe("ab");

    act(() => {
      vi.advanceTimersByTime(300);
    });

    rerender({ value: "abcd" });

    expect(result.current).toBe("abcd");
  });

  it("supports custom equality checks", () => {
    const equalityFn = vi.fn(
      (previous: { q: string }, next: { q: string }) => previous.q === next.q,
    );

    const { result, rerender } = renderHook(
      ({ value }) =>
        useDebounce(value, 300, {
          equalityFn,
        }),
      {
        initialProps: { value: { q: "react" } },
      },
    );

    rerender({ value: { q: "react" } });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.q).toBe("react");

    rerender({ value: { q: "hooks" } });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.q).toBe("hooks");
    expect(equalityFn).toHaveBeenCalled();
  });
});
