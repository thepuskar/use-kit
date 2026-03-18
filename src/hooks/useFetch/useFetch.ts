import { useCallback, useEffect, useRef, useState } from "react";

export type FetchInput = RequestInfo | URL | null | undefined;
export type FetchStatus = "idle" | "loading" | "success" | "error";
export type FetchParser<T> = (response: Response) => Promise<T>;

export interface UseFetchOptions<T> {
  enabled?: boolean;
  initialData?: T | null;
  cacheTime?: number;
  cacheKey?: string | null;
  keepPreviousData?: boolean;
  parse?: FetchParser<T>;
}

export interface RefetchOptions {
  ignoreCache?: boolean;
}

export interface UseFetchResult<T> {
  data: T | null;
  error: Error | UseFetchError | null;
  response: Response | null;
  status: FetchStatus;
  statusCode: number | null;
  loading: boolean;
  isFetching: boolean;
  isIdle: boolean;
  isSuccess: boolean;
  isError: boolean;
  refetch: (options?: RefetchOptions) => Promise<T | null>;
  abort: () => void;
}

interface FetchState<T> {
  data: T | null;
  error: Error | UseFetchError | null;
  response: Response | null;
  status: FetchStatus;
  statusCode: number | null;
  isFetching: boolean;
}

interface CacheEntry<T> {
  data: T;
  statusCode: number | null;
  expiresAt: number;
}

const responseCache = new Map<string, CacheEntry<unknown>>();

export class UseFetchError<T = unknown> extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly data: T | null;
  readonly response: Response;

  constructor(response: Response, data: T | null) {
    super(`Request failed with status ${response.status}`);
    this.name = "UseFetchError";
    this.status = response.status;
    this.statusText = response.statusText;
    this.data = data;
    this.response = response;
  }
}

function getInitialState<T>(
  input: FetchInput,
  enabled: boolean,
  initialData: T | null,
): FetchState<T> {
  if (enabled && input != null) {
    return {
      data: initialData,
      error: null,
      response: null,
      status: "loading",
      statusCode: null,
      isFetching: true,
    };
  }

  return {
    data: initialData,
    error: null,
    response: null,
    status: initialData === null ? "idle" : "success",
    statusCode: null,
    isFetching: false,
  };
}

function getDefaultParser<T>(): FetchParser<T> {
  return async (response) => {
    if (
      response.status === 204 ||
      response.status === 205 ||
      response.headers.get("content-length") === "0"
    ) {
      return null as T;
    }

    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

    if (contentType.includes("json")) {
      return (await response.json()) as T;
    }

    if (
      contentType.startsWith("text/") ||
      contentType.includes("xml") ||
      contentType.includes("html")
    ) {
      return (await response.text()) as T;
    }

    return (await response.blob()) as T;
  };
}

function getCacheKey(
  input: FetchInput,
  init: RequestInit | undefined,
  cacheKey: string | null | undefined,
): string | null {
  if (cacheKey !== undefined) {
    return cacheKey;
  }

  if (input == null) {
    return null;
  }

  const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();

  if (method !== "GET" && method !== "HEAD") {
    return null;
  }

  const url =
    typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

  return `${method}:${url}`;
}

function serializeHeaders(headers?: HeadersInit): string {
  if (!headers) {
    return "";
  }

  const normalizedHeaders: Array<[string, string]> = [];

  new Headers(headers).forEach((value, key) => {
    normalizedHeaders.push([key, value]);
  });

  return normalizedHeaders
    .map(([key, value]) => `${key}:${value}`)
    .sort()
    .join("|");
}

function serializeBody(body?: BodyInit | null): string {
  if (body == null) {
    return "";
  }

  if (typeof body === "string") {
    return body;
  }

  if (body instanceof URLSearchParams) {
    return body.toString();
  }

  if (typeof FormData !== "undefined" && body instanceof FormData) {
    const entries: string[] = [];
    body.forEach((value, key) => {
      entries.push(`${key}:${typeof value === "string" ? value : value.name}`);
    });
    return entries.join("&");
  }

  if (typeof Blob !== "undefined" && body instanceof Blob) {
    return `blob:${body.size}:${body.type}`;
  }

  if (body instanceof ArrayBuffer) {
    return `arraybuffer:${body.byteLength}`;
  }

  if (ArrayBuffer.isView(body)) {
    return `arraybuffer-view:${body.byteLength}`;
  }

  return "";
}

function getRequestSignature(input: FetchInput, init?: RequestInit): string {
  if (input == null) {
    return "null";
  }

  const url =
    typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
  const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
  const headers = serializeHeaders(
    init?.headers ?? (input instanceof Request ? input.headers : undefined),
  );
  const body = serializeBody(init?.body);

  return [
    method,
    url,
    headers,
    body,
    init?.cache ?? "",
    init?.credentials ?? "",
    init?.integrity ?? "",
    init?.keepalive ? "keepalive" : "",
    init?.mode ?? "",
    init?.redirect ?? "",
    init?.referrer ?? "",
    init?.referrerPolicy ?? "",
  ].join("::");
}

function mergeSignals(
  controllerSignal: AbortSignal,
  requestSignal?: AbortSignal | null,
): AbortSignal {
  if (!requestSignal) {
    return controllerSignal;
  }

  const abortSignalWithAny = AbortSignal as typeof AbortSignal & {
    any?: (signals: AbortSignal[]) => AbortSignal;
  };

  if (typeof abortSignalWithAny.any === "function") {
    return abortSignalWithAny.any([controllerSignal, requestSignal]);
  }

  return controllerSignal;
}

function getCachedValue<T>(cacheKey: string): CacheEntry<T> | null {
  const cachedEntry = responseCache.get(cacheKey) as CacheEntry<T> | undefined;

  if (!cachedEntry) {
    return null;
  }

  if (cachedEntry.expiresAt !== Infinity && cachedEntry.expiresAt <= Date.now()) {
    responseCache.delete(cacheKey);
    return null;
  }

  return cachedEntry;
}

function setCachedValue<T>(cacheKey: string, data: T, statusCode: number, cacheTime: number) {
  responseCache.set(cacheKey, {
    data,
    statusCode,
    expiresAt: cacheTime === Infinity ? Infinity : Date.now() + cacheTime,
  });
}

async function readErrorData<T>(response: Response, parser: FetchParser<T>): Promise<T | null> {
  try {
    return await parser(response.clone());
  } catch {
    return null;
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export function clearUseFetchCache(cacheKey?: string): void {
  if (cacheKey) {
    responseCache.delete(cacheKey);
    return;
  }

  responseCache.clear();
}

/**
 * Fetch a resource with small cache controls, abort handling, and configurable parsing.
 */
export function useFetch<T = unknown>(
  input: FetchInput,
  init?: RequestInit,
  options: UseFetchOptions<T> = {},
): UseFetchResult<T> {
  const {
    enabled = true,
    initialData = null,
    cacheTime = 0,
    cacheKey,
    keepPreviousData = true,
    parse,
  } = options;

  const [state, setState] = useState<FetchState<T>>(() =>
    getInitialState(input, enabled, initialData),
  );

  const controllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const inputRef = useRef(input);
  const initRef = useRef(init);
  const parseRef = useRef(parse);
  const initialDataRef = useRef(initialData);
  const requestSignature = getRequestSignature(input, init);

  inputRef.current = input;
  initRef.current = init;
  parseRef.current = parse;
  initialDataRef.current = initialData;

  const abort = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }

    setState((currentState) => {
      if (!currentState.isFetching) {
        return currentState;
      }

      return {
        ...currentState,
        error: null,
        status: currentState.data === null ? "idle" : "success",
        isFetching: false,
      };
    });
  }, []);

  const execute = useCallback(
    async ({ ignoreCache = false }: RefetchOptions = {}): Promise<T | null> => {
      const currentInput = inputRef.current;
      const currentInit = initRef.current;
      const parser = parseRef.current ?? getDefaultParser<T>();

      if (currentInput == null) {
        return null;
      }

      const resolvedCacheKey = getCacheKey(currentInput, currentInit, cacheKey);

      if (!ignoreCache && cacheTime > 0 && resolvedCacheKey) {
        const cachedEntry = getCachedValue<T>(resolvedCacheKey);

        if (cachedEntry) {
          setState({
            data: cachedEntry.data,
            error: null,
            response: null,
            status: "success",
            statusCode: cachedEntry.statusCode,
            isFetching: false,
          });

          return cachedEntry.data;
        }
      }

      if (controllerRef.current) {
        controllerRef.current.abort();
      }

      const controller = new AbortController();
      controllerRef.current = controller;
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      setState((currentState) => ({
        data: keepPreviousData ? currentState.data : initialDataRef.current,
        error: null,
        response: keepPreviousData ? currentState.response : null,
        status: "loading",
        statusCode: keepPreviousData ? currentState.statusCode : null,
        isFetching: true,
      }));

      try {
        const response = await fetch(currentInput, {
          ...currentInit,
          signal: mergeSignals(controller.signal, currentInit?.signal),
        });

        if (!response.ok) {
          const errorData = await readErrorData(response, parser);
          throw new UseFetchError(response, errorData);
        }

        const data = await parser(response);

        if (requestId !== requestIdRef.current || controller.signal.aborted) {
          return null;
        }

        controllerRef.current = null;

        if (cacheTime > 0 && resolvedCacheKey) {
          setCachedValue(resolvedCacheKey, data, response.status, cacheTime);
        }

        setState({
          data,
          error: null,
          response,
          status: "success",
          statusCode: response.status,
          isFetching: false,
        });

        return data;
      } catch (error) {
        if (requestId !== requestIdRef.current) {
          return null;
        }

        controllerRef.current = null;

        if (controller.signal.aborted || isAbortError(error)) {
          setState((currentState) => ({
            ...currentState,
            error: null,
            status: currentState.data === null ? "idle" : "success",
            isFetching: false,
          }));

          return null;
        }

        const resolvedError = error instanceof Error ? error : new Error("Unknown fetch error");
        const fetchError = resolvedError instanceof UseFetchError ? resolvedError : resolvedError;

        setState((currentState) => ({
          ...currentState,
          error: fetchError,
          response:
            fetchError instanceof UseFetchError ? fetchError.response : currentState.response,
          status: "error",
          statusCode: fetchError instanceof UseFetchError ? fetchError.status : null,
          isFetching: false,
        }));

        return null;
      }
    },
    [cacheKey, cacheTime, keepPreviousData],
  );

  const refetch = useCallback(
    (refetchOptions?: RefetchOptions) =>
      execute({
        ignoreCache: refetchOptions?.ignoreCache ?? true,
      }),
    [execute],
  );

  useEffect(() => {
    if (!enabled || input == null) {
      abort();
      return;
    }

    void execute({
      ignoreCache: false,
    });

    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
        controllerRef.current = null;
      }
    };
  }, [abort, enabled, execute, requestSignature]);

  return {
    data: state.data,
    error: state.error,
    response: state.response,
    status: state.status,
    statusCode: state.statusCode,
    loading: state.isFetching,
    isFetching: state.isFetching,
    isIdle: state.status === "idle",
    isSuccess: state.status === "success",
    isError: state.status === "error",
    refetch,
    abort,
  };
}
