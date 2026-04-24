import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { usePrevious } from "../src/client/hooks";

describe("usePrevious", () => {
  it("returns undefined before a previous value exists", () => {
    const { result } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: "react" },
    });

    expect(result.current).toBeUndefined();
  });

  it("returns the previous committed value", () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: "react" },
    });

    rerender({ value: "react hooks" });
    expect(result.current).toBe("react");

    rerender({ value: "react hooks library" });
    expect(result.current).toBe("react hooks");
  });

  it("supports an explicit initial value", () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value, { initialValue: 0 }),
      {
        initialProps: { value: 10 },
      },
    );

    expect(result.current).toBe(0);

    rerender({ value: 20 });
    expect(result.current).toBe(10);
  });

  it("skips equivalent values with a custom equality function", () => {
    const equalityFn = vi.fn(
      (previous: { id: number; label: string }, next: { id: number; label: string }) =>
        previous.id === next.id,
    );

    const { result, rerender } = renderHook(
      ({ value }) =>
        usePrevious(value, {
          equalityFn,
        }),
      {
        initialProps: { value: { id: 1, label: "initial" } },
      },
    );

    rerender({ value: { id: 1, label: "same item" } });
    expect(result.current).toEqual({ id: 1, label: "initial" });

    rerender({ value: { id: 2, label: "next item" } });
    expect(result.current).toEqual({ id: 1, label: "initial" });
    expect(equalityFn).toHaveBeenCalled();
  });

  it("resets previous tracking when reset keys change", () => {
    const { result, rerender } = renderHook(
      ({ userId, value }) =>
        usePrevious(value, {
          initialValue: "no previous value",
          resetKeys: [userId],
        }),
      {
        initialProps: { userId: "user-1", value: "first draft" },
      },
    );

    rerender({ userId: "user-1", value: "updated draft" });
    expect(result.current).toBe("first draft");

    rerender({ userId: "user-2", value: "new user draft" });
    expect(result.current).toBe("no previous value");

    rerender({ userId: "user-2", value: "new user updated draft" });
    expect(result.current).toBe("new user draft");
  });

  it("stores cloned snapshots when a clone function is provided", () => {
    const initialValue = { count: 1 };
    const nextValue = { count: 2 };

    const { result, rerender } = renderHook(
      ({ value }) =>
        usePrevious(value, {
          clone: (currentValue) => ({ ...currentValue }),
        }),
      {
        initialProps: { value: initialValue },
      },
    );

    initialValue.count = 99;
    rerender({ value: nextValue });

    expect(result.current).toEqual({ count: 1 });
    expect(result.current).not.toBe(initialValue);
  });
});
