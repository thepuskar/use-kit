import {
  WindowSizeBreakpointKey,
  WindowSizeBreakpoints,
  WindowSizeOrientation,
  WindowSizeSnapshot,
  WindowSizeStoreSnapshot,
} from "./window-size.types";

export const DEFAULT_WINDOW_SIZE_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

type WindowSizeBreakpointEntry<TBreakpoints extends WindowSizeBreakpoints> = [
  WindowSizeBreakpointKey<TBreakpoints>,
  number,
];

export interface CreateWindowSizeSnapshotOptions {
  useVisualViewport?: boolean;
  round?: boolean;
}

export interface CreateWindowSizeStoreSnapshotOptions {
  initialWidth?: number;
  initialHeight?: number;
}

export interface WindowSizeDeviceFlags {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export function isWindowSizeBrowser(): boolean {
  return typeof window !== "undefined";
}

function sanitizeDimension(value: number | undefined, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function sanitizeDevicePixelRatio(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 1;
}

function maybeRound(value: number, round: boolean | undefined): number {
  return round ? Math.round(value) : value;
}

export function createInitialWindowSizeStoreSnapshot(
  options: CreateWindowSizeStoreSnapshotOptions = {},
): WindowSizeStoreSnapshot {
  const width = sanitizeDimension(options.initialWidth);
  const height = sanitizeDimension(options.initialHeight);

  return {
    layoutWidth: width,
    layoutHeight: height,
    visualWidth: width,
    visualHeight: height,
    devicePixelRatio: 1,
    isClient: false,
  };
}

export function readWindowSizeStoreSnapshot(): WindowSizeStoreSnapshot {
  if (!isWindowSizeBrowser()) {
    return createInitialWindowSizeStoreSnapshot();
  }

  const layoutWidth = sanitizeDimension(window.innerWidth);
  const layoutHeight = sanitizeDimension(window.innerHeight);
  const visualViewport = window.visualViewport;
  const visualWidth = sanitizeDimension(visualViewport?.width, layoutWidth);
  const visualHeight = sanitizeDimension(visualViewport?.height, layoutHeight);

  return {
    layoutWidth,
    layoutHeight,
    visualWidth,
    visualHeight,
    devicePixelRatio: sanitizeDevicePixelRatio(window.devicePixelRatio),
    isClient: true,
  };
}

export function areWindowSizeStoreSnapshotsEqual(
  previousSnapshot: WindowSizeStoreSnapshot,
  nextSnapshot: WindowSizeStoreSnapshot,
): boolean {
  return (
    Object.is(previousSnapshot.layoutWidth, nextSnapshot.layoutWidth) &&
    Object.is(previousSnapshot.layoutHeight, nextSnapshot.layoutHeight) &&
    Object.is(previousSnapshot.visualWidth, nextSnapshot.visualWidth) &&
    Object.is(previousSnapshot.visualHeight, nextSnapshot.visualHeight) &&
    Object.is(previousSnapshot.devicePixelRatio, nextSnapshot.devicePixelRatio) &&
    Object.is(previousSnapshot.isClient, nextSnapshot.isClient)
  );
}

export function createWindowSizeSnapshot(
  storeSnapshot: WindowSizeStoreSnapshot,
  options: CreateWindowSizeSnapshotOptions = {},
): WindowSizeSnapshot {
  const width = options.useVisualViewport ? storeSnapshot.visualWidth : storeSnapshot.layoutWidth;
  const height = options.useVisualViewport
    ? storeSnapshot.visualHeight
    : storeSnapshot.layoutHeight;

  return {
    width: maybeRound(width, options.round),
    height: maybeRound(height, options.round),
    visualWidth: maybeRound(storeSnapshot.visualWidth, options.round),
    visualHeight: maybeRound(storeSnapshot.visualHeight, options.round),
    devicePixelRatio: storeSnapshot.devicePixelRatio,
    isClient: storeSnapshot.isClient,
  };
}

export function getWindowSizeOrientation(width: number, height: number): WindowSizeOrientation {
  return width > height ? "landscape" : "portrait";
}

export function getWindowSizeBreakpointEntries<TBreakpoints extends WindowSizeBreakpoints>(
  breakpoints: TBreakpoints,
): Array<WindowSizeBreakpointEntry<TBreakpoints>> {
  return (Object.entries(breakpoints) as Array<WindowSizeBreakpointEntry<TBreakpoints>>)
    .filter(([, value]) => Number.isFinite(value))
    .sort(([, previousValue], [, nextValue]) => previousValue - nextValue);
}

export function getWindowSizeBreakpointSignature(breakpoints: WindowSizeBreakpoints): string {
  return JSON.stringify(
    Object.entries(breakpoints).sort(([previousKey], [nextKey]) =>
      previousKey.localeCompare(nextKey),
    ),
  );
}

export function getWindowSizeBreakpoint<TBreakpoints extends WindowSizeBreakpoints>(
  width: number,
  breakpoints: TBreakpoints,
): WindowSizeBreakpointKey<TBreakpoints> | null {
  let activeBreakpoint: WindowSizeBreakpointKey<TBreakpoints> | null = null;

  getWindowSizeBreakpointEntries(breakpoints).forEach(([key, value]) => {
    if (width >= value) {
      activeBreakpoint = key;
    }
  });

  return activeBreakpoint;
}

function getBreakpointValue<TBreakpoints extends WindowSizeBreakpoints>(
  breakpoints: TBreakpoints,
  key: WindowSizeBreakpointKey<TBreakpoints>,
): number | null {
  const value = breakpoints[key];

  return Number.isFinite(value) ? value : null;
}

function getNamedBreakpointValue(breakpoints: WindowSizeBreakpoints, key: string): number | null {
  const value = breakpoints[key];

  return Number.isFinite(value) ? value : null;
}

function getDerivedWindowSizeDeviceFlagBreakpoints(
  breakpoints: WindowSizeBreakpoints,
): { tabletMin: number; desktopMin: number } | null {
  const breakpointValues = getWindowSizeBreakpointEntries(breakpoints).map(([, value]) => value);

  if (breakpointValues.length >= 3) {
    return {
      tabletMin: breakpointValues[1],
      desktopMin: breakpointValues[2],
    };
  }

  if (breakpointValues.length >= 2) {
    return {
      tabletMin: breakpointValues[0],
      desktopMin: breakpointValues[1],
    };
  }

  return null;
}

export function isAboveWindowSizeBreakpoint<TBreakpoints extends WindowSizeBreakpoints>(
  width: number,
  breakpoints: TBreakpoints,
  key: WindowSizeBreakpointKey<TBreakpoints>,
): boolean {
  const value = getBreakpointValue(breakpoints, key);

  return value === null ? false : width >= value;
}

export function isBelowWindowSizeBreakpoint<TBreakpoints extends WindowSizeBreakpoints>(
  width: number,
  breakpoints: TBreakpoints,
  key: WindowSizeBreakpointKey<TBreakpoints>,
): boolean {
  const value = getBreakpointValue(breakpoints, key);

  return value === null ? false : width < value;
}

export function isBetweenWindowSizeBreakpoints<TBreakpoints extends WindowSizeBreakpoints>(
  width: number,
  breakpoints: TBreakpoints,
  min: WindowSizeBreakpointKey<TBreakpoints>,
  max: WindowSizeBreakpointKey<TBreakpoints>,
): boolean {
  const minValue = getBreakpointValue(breakpoints, min);
  const maxValue = getBreakpointValue(breakpoints, max);

  return minValue === null || maxValue === null ? false : width >= minValue && width < maxValue;
}

export function getWindowSizeDeviceFlags(
  width: number,
  breakpoints: WindowSizeBreakpoints = DEFAULT_WINDOW_SIZE_BREAKPOINTS,
): WindowSizeDeviceFlags {
  const derivedBreakpoints = getDerivedWindowSizeDeviceFlagBreakpoints(breakpoints);
  const tabletMin =
    getNamedBreakpointValue(breakpoints, "md") ??
    getNamedBreakpointValue(breakpoints, "tablet") ??
    derivedBreakpoints?.tabletMin ??
    DEFAULT_WINDOW_SIZE_BREAKPOINTS.md;
  const desktopMin =
    getNamedBreakpointValue(breakpoints, "lg") ??
    getNamedBreakpointValue(breakpoints, "desktop") ??
    derivedBreakpoints?.desktopMin ??
    DEFAULT_WINDOW_SIZE_BREAKPOINTS.lg;
  const resolvedTabletMin =
    tabletMin < desktopMin
      ? tabletMin
      : (derivedBreakpoints?.tabletMin ?? DEFAULT_WINDOW_SIZE_BREAKPOINTS.md);
  const resolvedDesktopMin =
    tabletMin < desktopMin
      ? desktopMin
      : (derivedBreakpoints?.desktopMin ?? DEFAULT_WINDOW_SIZE_BREAKPOINTS.lg);

  return {
    isMobile: width < resolvedTabletMin,
    isTablet: width >= resolvedTabletMin && width < resolvedDesktopMin,
    isDesktop: width >= resolvedDesktopMin,
  };
}

export function getWindowSizeRemountKey(
  breakpoint: string | null,
  orientation: WindowSizeOrientation,
): string {
  return `${breakpoint ?? "base"}:${orientation}`;
}
