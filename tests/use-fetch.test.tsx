import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { clearUseFetchCache, useFetch, UseFetchError } from "../src/client/hooks";

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "content-type": "application/json",
    },
    ...init,
  });
}

function textResponse(body: string, init?: ResponseInit): Response {
  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/plain",
    },
    ...init,
  });
}

const originalFetch = globalThis.fetch;

describe("useFetch", () => {
  beforeEach(() => {
    clearUseFetchCache();
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    clearUseFetchCache();
    globalThis.fetch = originalFetch;
  });

  it("fetches JSON data by default", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(jsonResponse([{ id: 1, title: "Hooks" }]));

    const { result } = renderHook(() => useFetch<{ id: number; title: string }[]>("/posts"));

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([{ id: 1, title: "Hooks" }]);
    expect(result.current.statusCode).toBe(200);
    expect(result.current.loading).toBe(false);
  });

  it("parses text responses without a custom parser", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(textResponse("hello world"));

    const { result } = renderHook(() => useFetch<string>("/message"));

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBe("hello world");
  });

  it("supports manual mode and explicit refetch", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(jsonResponse({ id: 1 }));

    const { result } = renderHook(() =>
      useFetch<{ id: number }>("/manual", undefined, {
        enabled: false,
      }),
    );

    expect(result.current.isIdle).toBe(true);
    expect(globalThis.fetch).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.refetch();
    });

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual({ id: 1 });
  });

  it("aborts the previous request and ignores stale responses", async () => {
    let firstResolve: ((value: Response) => void) | null = null;
    let secondResolve: ((value: Response) => void) | null = null;
    let firstSignal: AbortSignal | undefined;

    vi.mocked(globalThis.fetch)
      .mockImplementationOnce(async (_input, init) => {
        firstSignal = init?.signal as AbortSignal | undefined;

        return await new Promise<Response>((resolve) => {
          firstResolve = resolve;
        });
      })
      .mockImplementationOnce(
        async () =>
          await new Promise<Response>((resolve) => {
            secondResolve = resolve;
          }),
      );

    const { result, rerender } = renderHook(({ url }) => useFetch<{ id: number }>(url), {
      initialProps: {
        url: "/first",
      },
    });

    rerender({
      url: "/second",
    });

    expect(firstSignal?.aborted).toBe(true);

    await act(async () => {
      secondResolve?.(jsonResponse({ id: 2 }));
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 2 });
    });

    await act(async () => {
      firstResolve?.(jsonResponse({ id: 1 }));
    });

    expect(result.current.data).toEqual({ id: 2 });
  });

  it("supports a custom parser", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(textResponse("hello"));

    const { result } = renderHook(() =>
      useFetch<string>("/custom", undefined, {
        parse: async (response) => (await response.text()).toUpperCase(),
      }),
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBe("HELLO");
  });

  it("returns a rich error for failed responses", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      jsonResponse(
        {
          message: "Not found",
        },
        {
          status: 404,
          statusText: "Not Found",
        },
      ),
    );

    const { result } = renderHook(() => useFetch("/missing"));

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(UseFetchError);
    expect((result.current.error as UseFetchError<{ message: string }>).status).toBe(404);
    expect((result.current.error as UseFetchError<{ message: string }>).data).toEqual({
      message: "Not found",
    });
  });

  it("uses cache when cacheTime is enabled and refetch bypasses it", async () => {
    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce(jsonResponse({ id: 1 }))
      .mockResolvedValueOnce(jsonResponse({ id: 2 }));

    const firstRender = renderHook(() =>
      useFetch<{ id: number }>("/cache", undefined, {
        cacheTime: 60_000,
      }),
    );

    await waitFor(() => {
      expect(firstRender.result.current.data).toEqual({ id: 1 });
    });

    firstRender.unmount();

    const { result } = renderHook(() =>
      useFetch<{ id: number }>("/cache", undefined, {
        cacheTime: 60_000,
      }),
    );

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 1 });
    });

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refetch();
    });

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(result.current.data).toEqual({ id: 2 });
  });
});
