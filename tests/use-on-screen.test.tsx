import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useOnScreen } from "../src/client/hooks";

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  readonly observe = vi.fn();
  readonly disconnect = vi.fn();

  constructor(
    private readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit,
  ) {
    MockIntersectionObserver.instances.push(this);
  }

  trigger(target: Element, isIntersecting: boolean) {
    this.callback(
      [
        {
          target,
          isIntersecting,
          intersectionRatio: isIntersecting ? 1 : 0,
          time: Date.now(),
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver,
    );
  }

  static reset() {
    MockIntersectionObserver.instances = [];
  }
}

const originalIntersectionObserver = window.IntersectionObserver;

describe("useOnScreen", () => {
  beforeEach(() => {
    MockIntersectionObserver.reset();
    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      writable: true,
      value: MockIntersectionObserver,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      writable: true,
      value: originalIntersectionObserver,
    });
  });

  it("returns a boolean visibility state for the provided ref", () => {
    const ref = {
      current: document.createElement("div"),
    };

    const { result } = renderHook(() => useOnScreen(ref));

    const observer = MockIntersectionObserver.instances[0];

    expect(observer.observe).toHaveBeenCalledWith(ref.current);
    expect(result.current).toBe(false);

    act(() => {
      observer.trigger(ref.current, true);
    });

    expect(result.current).toBe(true);
  });

  it("forwards observer options and supports the once alias", () => {
    const ref = {
      current: document.createElement("div"),
    };

    const { result } = renderHook(() =>
      useOnScreen(ref, {
        threshold: 0.5,
        rootMargin: "25px",
        once: true,
      }),
    );

    const observer = MockIntersectionObserver.instances[0];

    expect(observer.options?.threshold).toBe(0.5);
    expect(observer.options?.rootMargin).toBe("25px");

    act(() => {
      observer.trigger(ref.current, true);
    });

    expect(result.current).toBe(true);
    expect(observer.disconnect).toHaveBeenCalledTimes(1);
  });

  it("supports fallback values when IntersectionObserver is unavailable", () => {
    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      writable: true,
      value: undefined,
    });

    const ref = {
      current: document.createElement("div"),
    };

    const { result } = renderHook(() =>
      useOnScreen(ref, {
        fallbackInView: true,
      }),
    );

    expect(result.current).toBe(true);
    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  it("respects disabled and initial visibility options", () => {
    const ref = {
      current: document.createElement("div"),
    };

    const { result } = renderHook(() =>
      useOnScreen(ref, {
        disabled: true,
        initialIsVisible: true,
      }),
    );

    expect(MockIntersectionObserver.instances).toHaveLength(0);
    expect(result.current).toBe(true);
  });
});
