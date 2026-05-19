import { useEffect, useMemo, useRef } from "react";

import { breakpoints as defaultBreakpoints } from "./constants";
import {
  BreakpointMap,
  BreakpointMatches,
  UseBreakpointOptions,
  UseBreakpointReturn,
} from "./types";
import { useMediaQueriesState } from "./useMediaQueries";

type BreakpointName<TBreakpoints extends BreakpointMap> = Extract<keyof TBreakpoints, string>;
type BreakpointEntries<TBreakpoints extends BreakpointMap> = Array<
  [BreakpointName<TBreakpoints>, string]
>;

function getBreakpointEntries<TBreakpoints extends BreakpointMap>(
  breakpointMap: TBreakpoints,
): BreakpointEntries<TBreakpoints> {
  return Object.entries(breakpointMap) as BreakpointEntries<TBreakpoints>;
}

function getBreakpointSignature(entries: readonly [string, string][]): string {
  return JSON.stringify(entries);
}

function createBreakpointQueriesFromEntries<TBreakpoints extends BreakpointMap>(
  entries: BreakpointEntries<TBreakpoints>,
): Record<BreakpointName<TBreakpoints>, string> {
  const queries = {} as Record<BreakpointName<TBreakpoints>, string>;

  entries.forEach(([key, value]) => {
    queries[key] = `(min-width: ${value})`;
  });

  return queries;
}

export function createBreakpointQueries<TBreakpoints extends BreakpointMap>(
  breakpointMap: TBreakpoints,
): Record<BreakpointName<TBreakpoints>, string> {
  return createBreakpointQueriesFromEntries(getBreakpointEntries(breakpointMap));
}

function getActiveBreakpoint<TBreakpoints extends BreakpointMap>(
  entries: BreakpointEntries<TBreakpoints>,
  matches: BreakpointMatches<TBreakpoints>,
): BreakpointName<TBreakpoints> | null {
  let activeBreakpoint: BreakpointName<TBreakpoints> | null = null;

  entries.forEach(([key]) => {
    if (matches[key]) {
      activeBreakpoint = key;
    }
  });

  return activeBreakpoint;
}

/**
 * Resolve the active breakpoint from configurable min-width media queries.
 */
export function useBreakpoint<TBreakpoints extends BreakpointMap = typeof defaultBreakpoints>(
  options: UseBreakpointOptions<TBreakpoints> = {},
): UseBreakpointReturn<TBreakpoints> {
  const {
    breakpoints: breakpointMap = defaultBreakpoints as unknown as TBreakpoints,
    onChange,
    ...mediaQueryOptions
  } = options;
  const entries = getBreakpointEntries(breakpointMap);
  const signature = getBreakpointSignature(entries);
  const stableBreakpointMap = useMemo(() => breakpointMap, [signature]);
  const stableEntries = useMemo(() => entries, [signature]);
  const queries = useMemo(() => createBreakpointQueriesFromEntries(stableEntries), [stableEntries]);
  const snapshot = useMediaQueriesState(queries, mediaQueryOptions);
  const matches = snapshot.matches as BreakpointMatches<TBreakpoints>;
  const activeBreakpoint = useMemo(
    () => getActiveBreakpoint(stableEntries, matches),
    [matches, stableEntries],
  );
  const previousBreakpointRef = useRef(activeBreakpoint);
  const hasMountedRef = useRef(false);
  const onChangeRef = useRef(onChange);

  onChangeRef.current = onChange;

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      previousBreakpointRef.current = activeBreakpoint;
      return;
    }

    if (Object.is(previousBreakpointRef.current, activeBreakpoint)) {
      return;
    }

    previousBreakpointRef.current = activeBreakpoint;
    onChangeRef.current?.(activeBreakpoint, matches);
  }, [activeBreakpoint, matches]);

  return useMemo<UseBreakpointReturn<TBreakpoints>>(
    () => ({
      breakpoint: activeBreakpoint,
      matches,
      queries,
      breakpoints: stableBreakpointMap,
      supported: snapshot.supported,
    }),
    [activeBreakpoint, matches, queries, snapshot.supported, stableBreakpointMap],
  );
}
