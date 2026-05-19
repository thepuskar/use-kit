export interface UseMediaQueryOptions {
  /**
   * Value used before the browser can resolve the query, or when `matchMedia` is unavailable.
   */
  defaultValue?: boolean;

  /**
   * Value returned during server rendering and the hydration pass.
   * Defaults to `defaultValue`.
   */
  ssrValue?: boolean;

  /**
   * Read the browser value during the first client render.
   * Set this to `false` when you want the first client snapshot to stay on the fallback value.
   */
  initializeWithValue?: boolean;

  /**
   * Called after mount when the resolved match value changes.
   */
  onChange?: (matches: boolean) => void;
}

export interface UseMediaQueryReturn {
  /**
   * Whether the media query currently matches.
   */
  matches: boolean;

  /**
   * The media query string passed to the hook.
   */
  query: string;

  /**
   * Whether `window.matchMedia` is available for this query in the current environment.
   */
  supported: boolean;
}

export type MediaQueryMap = Record<string, string>;

export type UseMediaQueriesReturn<TQueries extends MediaQueryMap> = {
  readonly [Key in keyof TQueries]: boolean;
};

export interface UseMediaQueriesOptions<
  TQueries extends MediaQueryMap = MediaQueryMap,
> extends Omit<UseMediaQueryOptions, "onChange"> {
  /**
   * Called after mount when any resolved query match value changes.
   */
  onChange?: (matches: UseMediaQueriesReturn<TQueries>) => void;
}

export type BreakpointMap = Record<string, string>;

export type BreakpointMatches<TBreakpoints extends BreakpointMap> = {
  readonly [Key in keyof TBreakpoints]: boolean;
};

export interface UseBreakpointOptions<
  TBreakpoints extends BreakpointMap = BreakpointMap,
> extends Omit<
  UseMediaQueriesOptions<Record<Extract<keyof TBreakpoints, string>, string>>,
  "onChange"
> {
  /**
   * Named breakpoint widths ordered from smallest to largest.
   */
  breakpoints?: TBreakpoints;

  /**
   * Called after mount when the active breakpoint changes.
   */
  onChange?: (
    breakpoint: Extract<keyof TBreakpoints, string> | null,
    matches: BreakpointMatches<TBreakpoints>,
  ) => void;
}

export interface UseBreakpointReturn<TBreakpoints extends BreakpointMap = BreakpointMap> {
  /**
   * Largest matching breakpoint key, or `null` when no breakpoint matches.
   */
  breakpoint: Extract<keyof TBreakpoints, string> | null;

  /**
   * Match state for every configured breakpoint.
   */
  matches: BreakpointMatches<TBreakpoints>;

  /**
   * Media query string for every configured breakpoint.
   */
  queries: Record<Extract<keyof TBreakpoints, string>, string>;

  /**
   * Breakpoint widths used to build the queries.
   */
  breakpoints: TBreakpoints;

  /**
   * Whether `window.matchMedia` is available for all configured breakpoint queries.
   */
  supported: boolean;
}
