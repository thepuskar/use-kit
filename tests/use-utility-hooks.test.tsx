import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useGetLatest, useIsomorphicEffect, useMounted } from "../src/client/hooks";

describe("useMounted", () => {
  it("returns a function that is true while mounted and false after unmount", () => {
    const { result, unmount } = renderHook(() => useMounted());

    expect(typeof result.current).toBe("function");
    expect(result.current()).toBe(true);

    unmount();

    expect(result.current()).toBe(false);
  });
});

describe("useGetLatest", () => {
  it("keeps a ref pointing at the latest value", () => {
    const { result, rerender } = renderHook(({ value }) => useGetLatest(value), {
      initialProps: { value: "a" },
    });

    expect(result.current.current).toBe("a");

    rerender({ value: "b" });

    expect(result.current.current).toBe("b");
  });
});

describe("useIsomorphicEffect", () => {
  it("is a function suitable for isomorphic effect usage", () => {
    expect(typeof useIsomorphicEffect).toBe("function");
  });
});
