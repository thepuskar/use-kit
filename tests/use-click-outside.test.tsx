import { act, renderHook } from "@testing-library/react";
import { MutableRefObject } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useClickOutside } from "../src/client/hooks";

describe("useClickOutside", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("fires only when an interaction happens outside the target", () => {
    const handler = vi.fn();
    const inside = document.createElement("div");
    const outside = document.createElement("button");

    document.body.append(inside, outside);

    const { result } = renderHook(() => useClickOutside<HTMLDivElement>(handler));

    act(() => {
      (result.current as MutableRefObject<HTMLDivElement | null>).current = inside;
    });

    inside.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    outside.dispatchEvent(new Event("pointerdown", { bubbles: true }));

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(expect.any(Event));
  });

  it("supports the legacy event array and capture signature", () => {
    const addEventListenerSpy = vi.spyOn(document, "addEventListener");
    const handler = vi.fn();

    renderHook(() => useClickOutside(handler, ["mousedown", "touchstart"], false));

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "mousedown",
      expect.any(Function),
      expect.objectContaining({
        capture: false,
        passive: false,
      }),
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "touchstart",
      expect.any(Function),
      expect.objectContaining({
        capture: false,
        passive: false,
      }),
    );
  });

  it("supports external refs, additional refs, and ignored elements", () => {
    const handler = vi.fn();
    const panelRef = {
      current: document.createElement("div"),
    };
    const triggerRef = {
      current: document.createElement("button"),
    };
    const ignoredRef = {
      current: document.createElement("div"),
    };
    const outside = document.createElement("span");

    document.body.append(panelRef.current, triggerRef.current, ignoredRef.current, outside);

    renderHook(() =>
      useClickOutside(handler, {
        ref: panelRef,
        refs: [triggerRef],
        ignore: [ignoredRef],
      }),
    );

    triggerRef.current.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    ignoredRef.current.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    outside.dispatchEvent(new Event("pointerdown", { bubbles: true }));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not register listeners when disabled", () => {
    const addEventListenerSpy = vi.spyOn(document, "addEventListener");

    renderHook(() =>
      useClickOutside(() => undefined, {
        disabled: true,
      }),
    );

    expect(addEventListenerSpy).not.toHaveBeenCalled();
  });

  it("uses the latest handler without reattaching refs", () => {
    const firstHandler = vi.fn();
    const nextHandler = vi.fn();
    const inside = document.createElement("div");
    const outside = document.createElement("button");

    document.body.append(inside, outside);

    const { result, rerender } = renderHook(
      ({ handler }) => useClickOutside<HTMLDivElement>(handler),
      {
        initialProps: {
          handler: firstHandler,
        },
      },
    );

    act(() => {
      (result.current as MutableRefObject<HTMLDivElement | null>).current = inside;
    });

    rerender({
      handler: nextHandler,
    });

    outside.dispatchEvent(new Event("pointerdown", { bubbles: true }));

    expect(firstHandler).not.toHaveBeenCalled();
    expect(nextHandler).toHaveBeenCalledTimes(1);
  });
});
