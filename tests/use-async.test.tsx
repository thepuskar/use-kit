import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useAsync, useAsyncFn } from "../src/client/hooks";

describe("useAsyncFn", () => {
  it("starts idle with loading false", () => {
    const { result } = renderHook(() => useAsyncFn(async () => "ok"));

    expect(result.current[0]).toEqual({ loading: false });
  });

  it("tracks success and error for manual execute", async () => {
    const successFn = vi.fn(async (value: string) => value.toUpperCase());
    const { result } = renderHook(() => useAsyncFn(successFn));

    let resolved: string | undefined;

    await act(async () => {
      resolved = await result.current[1]("hello");
    });

    expect(resolved).toBe("HELLO");
    expect(result.current[0]).toEqual({ loading: false, value: "HELLO" });
    expect(successFn).toHaveBeenCalledWith("hello");

    const failingFn = vi.fn(async () => {
      throw new Error("boom");
    });
    const failing = renderHook(() => useAsyncFn(failingFn));

    await act(async () => {
      await expect(failing.result.current[1]()).rejects.toThrow("boom");
    });

    expect(failing.result.current[0].loading).toBe(false);
    expect(failing.result.current[0].error).toEqual(new Error("boom"));
  });
});

describe("useAsync", () => {
  it("stays idle when immediate is false", async () => {
    const fn = vi.fn(async () => "value");
    const { result } = renderHook(() => useAsync(fn, [], false));

    expect(result.current[0]).toEqual({ loading: false });
    expect(fn).not.toHaveBeenCalled();

    await act(async () => {
      await result.current[1]();
    });

    expect(result.current[0]).toEqual({ loading: false, value: "value" });
  });

  it("executes on mount when immediate is true", async () => {
    const fn = vi.fn(async () => "immediate");
    const { result } = renderHook(() => useAsync(fn, [], true));

    await act(async () => {
      await Promise.resolve();
    });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(result.current[0]).toEqual({ loading: false, value: "immediate" });
  });
});
