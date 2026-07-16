import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useWindowPosition } from "../src/client/hooks";

describe("useWindowPosition", () => {
  beforeEach(() => {
    Object.defineProperty(window, "scrollX", { configurable: true, value: 0, writable: true });
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0, writable: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reads the current scroll position after mount", () => {
    Object.defineProperty(window, "scrollX", { configurable: true, value: 24, writable: true });
    Object.defineProperty(window, "scrollY", { configurable: true, value: 48, writable: true });

    const { result } = renderHook(() => useWindowPosition());

    expect(result.current).toEqual({ x: 24, y: 48 });
  });

  it("updates when the window scrolls", () => {
    const { result } = renderHook(() => useWindowPosition());

    expect(result.current).toEqual({ x: 0, y: 0 });

    act(() => {
      Object.defineProperty(window, "scrollX", { configurable: true, value: 10, writable: true });
      Object.defineProperty(window, "scrollY", { configurable: true, value: 20, writable: true });
      window.dispatchEvent(new Event("scroll"));
    });

    expect(result.current).toEqual({ x: 10, y: 20 });
  });

  it("registers a passive scroll listener", () => {
    const addSpy = vi.spyOn(window, "addEventListener");

    renderHook(() => useWindowPosition());

    const scrollCall = addSpy.mock.calls.find((call) => call[0] === "scroll");
    expect(scrollCall?.[2]).toEqual({ passive: true });
  });
});
