import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";

import {
  getFallbackSnapshot,
  getMediaQuerySnapshot,
  isMatchMediaSupported,
  subscribeToMediaQueries,
} from "./store";
import { MediaQueryMap, UseMediaQueriesOptions, UseMediaQueriesReturn } from "./types";

const DEFAULT_VALUE = false;

interface MediaQueriesSnapshot<TQueries extends MediaQueryMap> {
  matches: UseMediaQueriesReturn<TQueries>;
  supported: boolean;
}

interface CachedMediaQueriesSnapshot<
  TQueries extends MediaQueryMap,
> extends MediaQueriesSnapshot<TQueries> {
  signature: string;
}

type MediaQueryEntries<TQueries extends MediaQueryMap> = Array<
  [Extract<keyof TQueries, string>, string]
>;

function getMediaQueryEntries<TQueries extends MediaQueryMap>(
  queries: TQueries,
): MediaQueryEntries<TQueries> {
  return Object.entries(queries) as MediaQueryEntries<TQueries>;
}

function getMediaQuerySignature(entries: readonly [string, string][]): string {
  return JSON.stringify(entries);
}

function areMatchesEqual<TQueries extends MediaQueryMap>(
  previousMatches: UseMediaQueriesReturn<TQueries>,
  nextMatches: UseMediaQueriesReturn<TQueries>,
  entries: MediaQueryEntries<TQueries>,
): boolean {
  return entries.every(([key]) => Object.is(previousMatches[key], nextMatches[key]));
}

function resolveMediaQueriesSnapshot<TQueries extends MediaQueryMap>({
  cacheRef,
  defaultValue,
  entries,
  forceFallback,
  signature,
}: {
  cacheRef: MutableRefObject<CachedMediaQueriesSnapshot<TQueries> | null>;
  defaultValue: boolean;
  entries: MediaQueryEntries<TQueries>;
  forceFallback: boolean;
  signature: string;
}): MediaQueriesSnapshot<TQueries> {
  const matches = {} as Record<Extract<keyof TQueries, string>, boolean>;
  let supported = entries.length === 0 ? !forceFallback && isMatchMediaSupported() : true;

  entries.forEach(([key, query]) => {
    const snapshot = forceFallback
      ? getFallbackSnapshot(defaultValue)
      : getMediaQuerySnapshot(query);
    const resolvedSnapshot = snapshot.supported ? snapshot : getFallbackSnapshot(defaultValue);

    matches[key] = resolvedSnapshot.matches;
    supported = supported && resolvedSnapshot.supported;
  });

  const nextSnapshot: MediaQueriesSnapshot<TQueries> = {
    matches: matches as UseMediaQueriesReturn<TQueries>,
    supported,
  };
  const cachedSnapshot = cacheRef.current;

  if (
    cachedSnapshot &&
    cachedSnapshot.signature === signature &&
    cachedSnapshot.supported === nextSnapshot.supported &&
    areMatchesEqual(cachedSnapshot.matches, nextSnapshot.matches, entries)
  ) {
    return cachedSnapshot;
  }

  const snapshotWithSignature: CachedMediaQueriesSnapshot<TQueries> = {
    ...nextSnapshot,
    signature,
  };

  cacheRef.current = snapshotWithSignature;
  return snapshotWithSignature;
}

export function useMediaQueriesState<TQueries extends MediaQueryMap>(
  queries: TQueries,
  options: UseMediaQueriesOptions<TQueries> = {},
): MediaQueriesSnapshot<TQueries> {
  const {
    defaultValue = DEFAULT_VALUE,
    ssrValue = defaultValue,
    initializeWithValue = true,
    onChange,
  } = options;
  const entries = getMediaQueryEntries(queries);
  const signature = getMediaQuerySignature(entries);
  const stableEntries = useMemo(() => entries, [signature]);
  const queryList = useMemo(() => stableEntries.map(([, query]) => query), [stableEntries]);
  const cacheRef = useRef<CachedMediaQueriesSnapshot<TQueries> | null>(null);
  const currentSignatureRef = useRef(signature);
  const didSubscribeRef = useRef(false);
  const onChangeRef = useRef(onChange);

  onChangeRef.current = onChange;

  if (currentSignatureRef.current !== signature) {
    currentSignatureRef.current = signature;
    didSubscribeRef.current = false;
  }

  const getSnapshot = useCallback(
    () =>
      resolveMediaQueriesSnapshot<TQueries>({
        cacheRef,
        defaultValue,
        entries: stableEntries,
        forceFallback: !initializeWithValue && !didSubscribeRef.current,
        signature,
      }),
    [defaultValue, initializeWithValue, signature, stableEntries],
  );

  const getServerSnapshot = useCallback(
    () =>
      resolveMediaQueriesSnapshot<TQueries>({
        cacheRef,
        defaultValue: ssrValue,
        entries: stableEntries,
        forceFallback: true,
        signature,
      }),
    [signature, ssrValue, stableEntries],
  );

  const subscribe = useCallback(
    (listener: () => void) => {
      didSubscribeRef.current = true;
      return subscribeToMediaQueries(queryList, listener);
    },
    [queryList],
  );

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const previousMatchesRef = useRef(snapshot.matches);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      previousMatchesRef.current = snapshot.matches;
      return;
    }

    if (areMatchesEqual(previousMatchesRef.current, snapshot.matches, stableEntries)) {
      return;
    }

    previousMatchesRef.current = snapshot.matches;
    onChangeRef.current?.(snapshot.matches);
  }, [snapshot.matches, stableEntries]);

  return snapshot;
}

/**
 * Subscribe to several CSS media queries and return a typed map of match values.
 */
export function useMediaQueries<TQueries extends MediaQueryMap>(
  queries: TQueries,
  options: UseMediaQueriesOptions<TQueries> = {},
): UseMediaQueriesReturn<TQueries> {
  return useMediaQueriesState(queries, options).matches;
}
