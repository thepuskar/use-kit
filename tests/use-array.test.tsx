import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useArray } from "../src/client/hooks";

describe("useArray", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes with derived metadata", () => {
    const { result } = renderHook(() => useArray(["react", "hooks"]));

    expect(result.current.value).toEqual(["react", "hooks"]);
    expect(result.current.length).toBe(2);
    expect(result.current.isEmpty).toBe(false);
  });

  it("supports lazy initialization once", () => {
    const initializer = vi.fn(() => ["react"]);

    const { result, rerender } = renderHook(() => useArray(initializer));

    rerender();

    expect(initializer).toHaveBeenCalledTimes(1);
    expect(result.current.value).toEqual(["react"]);
  });

  it("pushes one or many items", () => {
    const { result } = renderHook(() => useArray(["react"]));

    act(() => {
      result.current.push("hooks");
      result.current.push("docs", "utils");
    });

    expect(result.current.value).toEqual(["react", "hooks", "docs", "utils"]);
  });

  it("filters values and removes matching values", () => {
    const { result } = renderHook(() => useArray(["react", "docs", "docs", "utils"]));

    act(() => {
      result.current.filter((item) => item.includes("o"));
    });

    expect(result.current.value).toEqual(["docs", "docs"]);

    act(() => {
      result.current.removeValue("docs");
    });

    expect(result.current.value).toEqual([]);
    expect(result.current.isEmpty).toBe(true);
  });

  it("updates, removes, and moves items with safe indices", () => {
    const { result } = renderHook(() => useArray(["apple", "banana", "cherry"]));

    act(() => {
      result.current.update(-1, "citrus");
      result.current.removeAt(10);
      result.current.removeAt(1);
      result.current.move(1, 0);
    });

    expect(result.current.value).toEqual(["citrus", "apple"]);
  });

  it("clears and resets back to the initial snapshot", () => {
    const { result } = renderHook(() => useArray(["react", "typescript"]));

    act(() => {
      result.current.push("docs");
      result.current.clear();
    });

    expect(result.current.value).toEqual([]);
    expect(result.current.isEmpty).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.value).toEqual(["react", "typescript"]);
  });

  it("shuffles immutably", () => {
    vi.spyOn(Math, "random").mockReturnValueOnce(0).mockReturnValueOnce(0);

    const { result } = renderHook(() => useArray(["a", "b", "c"]));
    const initialReference = result.current.value;

    act(() => {
      result.current.shuffle();
    });

    expect(result.current.value).toEqual(["b", "c", "a"]);
    expect(result.current.value).not.toBe(initialReference);
  });

  it("exposes setValue for custom collection updates", () => {
    const { result } = renderHook(() => useArray([{ id: 1 }, { id: 2 }]));

    act(() => {
      result.current.setValue((currentValue) =>
        currentValue.map((item) => (item.id === 2 ? { ...item, id: 3 } : item)),
      );
    });

    expect(result.current.value).toEqual([{ id: 1 }, { id: 3 }]);
  });
});
