import { act, cleanup, renderHook } from "@testing-library/react";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";

import { useWindowSize } from "./use-window-size";

class MockVisualViewport extends EventTarget {
  width: number;
  height: number;
  readonly offsetLeft = 0;
  readonly offsetTop = 0;
  readonly pageLeft = 0;
  readonly pageTop = 0;
  readonly scale = 1;
  readonly addEventListener = vi.fn(
    (
      type: string,
      listener: EventListenerOrEventListenerObject | null,
      options?: boolean | AddEventListenerOptions,
    ) => {
      EventTarget.prototype.addEventListener.call(this, type, listener, options);
    },
  );
  readonly removeEventListener = vi.fn(
    (
      type: string,
      listener: EventListenerOrEventListenerObject | null,
      options?: boolean | EventListenerOptions,
    ) => {
      EventTarget.prototype.removeEventListener.call(this, type, listener, options);
    },
  );

  constructor(width: number, height: number) {
    super();
    this.width = width;
    this.height = height;
  }
}

const originalGlobalWindowDescriptor = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalInnerWidthDescriptor = Object.getOwnPropertyDescriptor(window, "innerWidth");
const originalInnerHeightDescriptor = Object.getOwnPropertyDescriptor(window, "innerHeight");
const originalDevicePixelRatioDescriptor = Object.getOwnPropertyDescriptor(
  window,
  "devicePixelRatio",
);
const originalVisualViewportDescriptor = Object.getOwnPropertyDescriptor(window, "visualViewport");

function restoreGlobalWindow(): void {
  if (originalGlobalWindowDescriptor) {
    Object.defineProperty(globalThis, "window", originalGlobalWindowDescriptor);
    return;
  }

  Reflect.deleteProperty(globalThis, "window");
}

function restoreWindowProperty(
  key: "innerWidth" | "innerHeight" | "devicePixelRatio" | "visualViewport",
  descriptor: PropertyDescriptor | undefined,
): void {
  if (descriptor) {
    Object.defineProperty(window, key, descriptor);
    return;
  }

  Reflect.deleteProperty(window, key);
}

function setWindowNumberProperty(
  key: "innerWidth" | "innerHeight" | "devicePixelRatio",
  value: number,
): void {
  Object.defineProperty(window, key, {
    configurable: true,
    writable: true,
    value,
  });
}

function setViewport(width: number, height: number, devicePixelRatio = 1): void {
  setWindowNumberProperty("innerWidth", width);
  setWindowNumberProperty("innerHeight", height);
  setWindowNumberProperty("devicePixelRatio", devicePixelRatio);
}

function setVisualViewport(visualViewport: MockVisualViewport | undefined): void {
  Object.defineProperty(window, "visualViewport", {
    configurable: true,
    writable: true,
    value: visualViewport,
  });
}

function dispatchResize(): void {
  window.dispatchEvent(new Event("resize"));
}

describe("useWindowSize", () => {
  beforeEach(() => {
    setViewport(1024, 768);
    setVisualViewport(undefined);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    restoreGlobalWindow();

    if (typeof window !== "undefined") {
      restoreWindowProperty("innerWidth", originalInnerWidthDescriptor);
      restoreWindowProperty("innerHeight", originalInnerHeightDescriptor);
      restoreWindowProperty("devicePixelRatio", originalDevicePixelRatioDescriptor);
      restoreWindowProperty("visualViewport", originalVisualViewportDescriptor);
    }
  });

  it("uses the SSR snapshot when window is unavailable", () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: undefined,
    });

    function ServerRenderedWindowSize() {
      const size = useWindowSize({
        initialWidth: 320,
        initialHeight: 480,
      });

      return createElement(
        "span",
        null,
        `${size.width}:${size.height}:${String(size.isClient)}:${size.orientation}`,
      );
    }

    try {
      expect(renderToString(createElement(ServerRenderedWindowSize))).toContain(
        "<span>320:480:false:portrait</span>",
      );
    } finally {
      restoreGlobalWindow();
    }
  });

  it("returns the initial client value", () => {
    setViewport(1280, 720, 2);

    const { result } = renderHook(() => useWindowSize());

    expect(result.current.width).toBe(1280);
    expect(result.current.height).toBe(720);
    expect(result.current.visualWidth).toBe(1280);
    expect(result.current.visualHeight).toBe(720);
    expect(result.current.devicePixelRatio).toBe(2);
    expect(result.current.isClient).toBe(true);
  });

  it("updates width and height after resize events", () => {
    setViewport(800, 600);
    const { result } = renderHook(() => useWindowSize());

    act(() => {
      setViewport(900, 650);
      dispatchResize();
    });

    expect(result.current.width).toBe(900);
    expect(result.current.height).toBe(650);
  });

  it("detects orientation from the active viewport dimensions", () => {
    setViewport(500, 900);
    const { result } = renderHook(() => useWindowSize());

    expect(result.current.orientation).toBe("portrait");
    expect(result.current.isPortrait).toBe(true);
    expect(result.current.isLandscape).toBe(false);

    act(() => {
      setViewport(900, 500);
      dispatchResize();
    });

    expect(result.current.orientation).toBe("landscape");
    expect(result.current.isPortrait).toBe(false);
    expect(result.current.isLandscape).toBe(true);
  });

  it("detects the active default breakpoint and device flags", () => {
    setViewport(1100, 700);

    const { result } = renderHook(() => useWindowSize());

    expect(result.current.breakpoint).toBe("lg");
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
  });

  it("supports custom breakpoint inference and runtime behavior", () => {
    const customBreakpoints = {
      compact: 360,
      comfortable: 900,
      wide: 1200,
    } as const;
    setViewport(950, 700);

    const { result } = renderHook(() =>
      useWindowSize({
        breakpoints: customBreakpoints,
      }),
    );

    expectTypeOf(result.current.breakpoint).toEqualTypeOf<
      "compact" | "comfortable" | "wide" | null
    >();
    expect(result.current.breakpoint).toBe("comfortable");
    expect(result.current.isAbove("comfortable")).toBe(true);
    expect(result.current.isBelow("wide")).toBe(true);
  });

  it("derives device flags from unnamed custom breakpoints", () => {
    const customBreakpoints = {
      small: 500,
      large: 1000,
    } as const;
    setViewport(600, 700);

    const { result } = renderHook(() =>
      useWindowSize({
        breakpoints: customBreakpoints,
      }),
    );

    expect(result.current.breakpoint).toBe("small");
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });

  it("resolves isAbove, isBelow, and isBetween helpers", () => {
    setViewport(800, 700);

    const { result } = renderHook(() => useWindowSize());

    expect(result.current.isAbove("sm")).toBe(true);
    expect(result.current.isAbove("lg")).toBe(false);
    expect(result.current.isBelow("lg")).toBe(true);
    expect(result.current.isBetween("sm", "lg")).toBe(true);
    expect(result.current.isBetween("lg", "xl")).toBe(false);
  });

  it("does not subscribe to updates when disabled", () => {
    setViewport(700, 600);
    const { result } = renderHook(() =>
      useWindowSize({
        enabled: false,
      }),
    );

    act(() => {
      setViewport(1000, 700);
      dispatchResize();
    });

    expect(result.current.width).toBe(700);
    expect(result.current.height).toBe(600);
  });

  it("uses visual viewport dimensions when enabled and available", () => {
    setViewport(1200, 900);
    const visualViewport = new MockVisualViewport(375, 667);
    setVisualViewport(visualViewport);
    const { result } = renderHook(() =>
      useWindowSize({
        useVisualViewport: true,
      }),
    );

    expect(result.current.width).toBe(375);
    expect(result.current.height).toBe(667);
    expect(result.current.visualWidth).toBe(375);
    expect(result.current.visualHeight).toBe(667);

    act(() => {
      visualViewport.width = 390;
      visualViewport.height = 700;
      visualViewport.dispatchEvent(new Event("resize"));
    });

    expect(result.current.width).toBe(390);
    expect(result.current.height).toBe(700);
  });

  it("returns devicePixelRatio", () => {
    setViewport(1024, 768, 2.5);

    const { result } = renderHook(() => useWindowSize());

    expect(result.current.devicePixelRatio).toBe(2.5);
  });

  it("rounds fractional viewport values when requested", () => {
    setViewport(100.6, 200.2);
    const visualViewport = new MockVisualViewport(300.4, 400.8);
    setVisualViewport(visualViewport);

    const { result } = renderHook(() =>
      useWindowSize({
        round: true,
      }),
    );

    expect(result.current.width).toBe(101);
    expect(result.current.height).toBe(200);
    expect(result.current.visualWidth).toBe(300);
    expect(result.current.visualHeight).toBe(401);
  });

  it("cleans up event listeners on unmount", () => {
    const addWindowListener = vi.spyOn(window, "addEventListener");
    const removeWindowListener = vi.spyOn(window, "removeEventListener");
    const visualViewport = new MockVisualViewport(800, 600);
    setVisualViewport(visualViewport);
    const { unmount } = renderHook(() =>
      useWindowSize({
        useVisualViewport: true,
      }),
    );

    expect(addWindowListener).toHaveBeenCalledWith("resize", expect.any(Function));
    expect(visualViewport.addEventListener).toHaveBeenCalledWith("resize", expect.any(Function));

    unmount();

    expect(removeWindowListener).toHaveBeenCalledWith("resize", expect.any(Function));
    expect(visualViewport.removeEventListener).toHaveBeenCalledWith("resize", expect.any(Function));
  });

  it("debounces resize notifications", () => {
    vi.useFakeTimers();
    setViewport(500, 400);
    const { result } = renderHook(() =>
      useWindowSize({
        debounceMs: 100,
      }),
    );

    act(() => {
      setViewport(600, 450);
      dispatchResize();
    });

    expect(result.current.width).toBe(500);

    act(() => {
      vi.advanceTimersByTime(99);
    });

    expect(result.current.width).toBe(500);

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current.width).toBe(600);
    expect(result.current.height).toBe(450);
  });

  it("throttles resize notifications", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    setViewport(500, 400);
    const { result } = renderHook(() =>
      useWindowSize({
        throttleMs: 100,
      }),
    );

    act(() => {
      setViewport(600, 450);
      dispatchResize();
    });

    expect(result.current.width).toBe(600);

    act(() => {
      vi.advanceTimersByTime(50);
      setViewport(700, 500);
      dispatchResize();
    });

    expect(result.current.width).toBe(600);

    act(() => {
      vi.advanceTimersByTime(49);
    });

    expect(result.current.width).toBe(600);

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current.width).toBe(700);
    expect(result.current.height).toBe(500);
  });
});
