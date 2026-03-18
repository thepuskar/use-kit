import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useMutation } from "../src/client/hooks";

function createDeferred<T>() {
  let resolve: ((value: T | PromiseLike<T>) => void) | null = null;
  let reject: ((reason?: unknown) => void) | null = null;

  const promise = new Promise<T>((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });

  return {
    promise,
    resolve: (value: T) => resolve?.(value),
    reject: (reason?: unknown) => reject?.(reason),
  };
}

describe("useMutation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts idle and supports a successful mutation", async () => {
    const onSuccess = vi.fn();
    const onSettled = vi.fn();

    const { result } = renderHook(() =>
      useMutation(
        async (title: string = "") => ({
          title: title.toUpperCase(),
        }),
        {
          onSuccess,
          onSettled,
        },
      ),
    );

    expect(result.current.isIdle).toBe(true);

    await act(async () => {
      await result.current.mutateAsync("react");
    });

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toEqual({
      title: "REACT",
    });
    expect(result.current.variables).toBe("react");
    expect(onSuccess).toHaveBeenCalledWith(
      {
        title: "REACT",
      },
      "react",
      undefined,
    );
    expect(onSettled).toHaveBeenCalledWith(
      {
        title: "REACT",
      },
      null,
      "react",
      undefined,
    );
  });

  it("supports lifecycle context and error handling", async () => {
    const onMutate = vi.fn((id: number = 0) => ({
      optimisticId: id,
    }));
    const onError = vi.fn();
    const onSettled = vi.fn();

    const { result } = renderHook(() =>
      useMutation<never, Error, number, { optimisticId: number }>(
        async (id = 0) => {
          throw new Error(`Unable to save ${id}`);
        },
        {
          onMutate,
          onError,
          onSettled,
        },
      ),
    );

    await expect(result.current.mutateAsync(7)).rejects.toThrow("Unable to save 7");

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Unable to save 7");
    expect(onMutate).toHaveBeenCalledWith(7);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Unable to save 7",
      }),
      7,
      {
        optimisticId: 7,
      },
    );
    expect(onSettled).toHaveBeenCalledWith(
      null,
      expect.objectContaining({
        message: "Unable to save 7",
      }),
      7,
      {
        optimisticId: 7,
      },
    );
  });

  it("supports fire-and-forget mutate", async () => {
    const { result } = renderHook(() =>
      useMutation(async (title: string = "") => ({
        title,
      })),
    );

    act(() => {
      result.current.mutate("docs");
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({
        title: "docs",
      });
    });
  });

  it("aborts the active mutation and returns to idle when no data exists", async () => {
    const deferred = createDeferred<void>();

    const { result } = renderHook(() =>
      useMutation(async (_value: string = "", { signal }) => {
        await deferred.promise;

        if (signal.aborted) {
          throw new DOMException("Aborted", "AbortError");
        }

        return { ok: true };
      }),
    );

    let mutationPromise: Promise<{ ok: boolean }> | null = null;

    act(() => {
      mutationPromise = result.current.mutateAsync("save");
    });

    act(() => {
      result.current.abort();
    });

    deferred.resolve();

    await expect(mutationPromise).rejects.toMatchObject({
      name: "AbortError",
    });

    await waitFor(() => {
      expect(result.current.isIdle).toBe(true);
    });

    expect(result.current.data).toBeNull();
  });

  it("ignores stale results when a newer mutation starts", async () => {
    const firstDeferred = createDeferred<{ id: number }>();
    const secondDeferred = createDeferred<{ id: number }>();
    const mutationFn = vi
      .fn()
      .mockImplementationOnce(async () => await firstDeferred.promise)
      .mockImplementationOnce(async () => await secondDeferred.promise);

    const { result } = renderHook(() => useMutation<{ id: number }>(mutationFn));

    let firstPromise: Promise<{ id: number }> | null = null;
    let secondPromise: Promise<{ id: number }> | null = null;

    act(() => {
      firstPromise = result.current.mutateAsync();
    });

    act(() => {
      secondPromise = result.current.mutateAsync();
    });

    secondDeferred.resolve({
      id: 2,
    });

    await expect(secondPromise).resolves.toEqual({
      id: 2,
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({
        id: 2,
      });
    });

    firstDeferred.resolve({
      id: 1,
    });

    await expect(firstPromise).rejects.toMatchObject({
      name: "AbortError",
    });
  });

  it("resets back to the initial snapshot", async () => {
    const { result } = renderHook(() =>
      useMutation(
        async (nextValue: string = "") => ({
          value: nextValue,
        }),
        {
          initialData: {
            value: "initial",
          },
        },
      ),
    );

    await act(async () => {
      await result.current.mutateAsync("updated");
    });

    expect(result.current.data).toEqual({
      value: "updated",
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.isIdle).toBe(true);
    expect(result.current.data).toEqual({
      value: "initial",
    });
    expect(result.current.variables).toBeNull();
  });
});
