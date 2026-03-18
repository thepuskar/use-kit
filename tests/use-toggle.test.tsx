import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useToggle } from "../src/client/hooks";

describe("useToggle", () => {
  it("defaults to false when no initial value is provided", () => {
    const { result } = renderHook(() => useToggle());

    expect(result.current[0]).toBe(false);
  });

  it("toggles boolean state", () => {
    const { result } = renderHook(() => useToggle(false));

    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1]();
    });

    expect(result.current[0]).toBe(true);
  });

  it("accepts an explicit boolean in toggle", () => {
    const { result } = renderHook(() => useToggle(false));

    act(() => {
      result.current[1](true);
    });

    expect(result.current[0]).toBe(true);

    act(() => {
      result.current[1](false);
    });

    expect(result.current[0]).toBe(false);
  });

  it("supports lazy initialization", () => {
    let calls = 0;

    const { result, rerender } = renderHook(() =>
      useToggle(() => {
        calls += 1;
        return true;
      }),
    );

    expect(result.current[0]).toBe(true);
    expect(calls).toBe(1);

    rerender();

    expect(calls).toBe(1);
  });

  it("exposes setTrue, setFalse, and reset helpers", () => {
    const { result } = renderHook(() => useToggle(true));

    act(() => {
      result.current[3].setFalse();
    });

    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[3].setTrue();
    });

    expect(result.current[0]).toBe(true);

    act(() => {
      result.current[2](false);
    });

    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[3].reset();
    });

    expect(result.current[0]).toBe(true);
  });

  it("keeps helper references stable across rerenders", () => {
    const { result, rerender } = renderHook(() => useToggle(false));

    const firstToggle = result.current[1];
    const firstSetValue = result.current[2];
    const firstActions = result.current[3];

    rerender();

    expect(result.current[1]).toBe(firstToggle);
    expect(result.current[2]).toBe(firstSetValue);
    expect(result.current[3]).toBe(firstActions);
  });
});
