import { act, renderHook } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useEventListener } from "../src/client/hooks";

describe("useEventListener", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("attaches and detaches a window listener", () => {
    const handler = vi.fn();
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() =>
      useEventListener({
        target: window,
        eventType: "resize",
        handler,
      }),
    );

    expect(addSpy).toHaveBeenCalledWith("resize", expect.any(Function), undefined);

    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    expect(handler).toHaveBeenCalledTimes(1);

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("resize", expect.any(Function), undefined);
  });

  it("passes passive options through when supported", () => {
    const handler = vi.fn();
    const addSpy = vi.spyOn(window, "addEventListener");

    renderHook(() =>
      useEventListener({
        target: window,
        eventType: "scroll",
        handler,
        options: { passive: true, capture: false },
      }),
    );

    const scrollCall = addSpy.mock.calls.find((call) => call[0] === "scroll");
    expect(scrollCall?.[2]).toEqual({ passive: true, capture: false });
  });

  it("binds to an element ref target", () => {
    const handler = vi.fn();
    const button = document.createElement("button");
    document.body.appendChild(button);

    const { unmount } = renderHook(() => {
      const ref = useRef<HTMLButtonElement | null>(button);
      useEventListener({
        target: ref,
        eventType: "click",
        handler,
      });
    });

    act(() => {
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(handler).toHaveBeenCalledTimes(1);

    unmount();
    button.remove();
  });

  it("does not attach when shouldAttach is false", () => {
    const handler = vi.fn();
    const addSpy = vi.spyOn(window, "addEventListener");
    addSpy.mockClear();

    renderHook(() =>
      useEventListener(
        {
          target: window,
          eventType: "keydown",
          handler,
        },
        false,
      ),
    );

    const keydownCalls = addSpy.mock.calls.filter((call) => call[0] === "keydown");
    expect(keydownCalls).toHaveLength(0);
  });
});
