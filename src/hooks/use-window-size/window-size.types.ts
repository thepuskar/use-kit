export type WindowSizeBreakpoints = Record<string, number>;

export type WindowSizeBreakpointKey<TBreakpoints extends WindowSizeBreakpoints> = Extract<
  keyof TBreakpoints,
  string
>;

export type WindowSizeOrientation = "portrait" | "landscape";

export interface WindowSizeStoreSnapshot {
  layoutWidth: number;
  layoutHeight: number;
  visualWidth: number;
  visualHeight: number;
  devicePixelRatio: number;
  isClient: boolean;
}

export interface WindowSizeSnapshot {
  width: number;
  height: number;
  visualWidth: number;
  visualHeight: number;
  devicePixelRatio: number;
  isClient: boolean;
}

export interface UseWindowSizeOptions<
  TBreakpoints extends WindowSizeBreakpoints = WindowSizeBreakpoints,
> {
  initialWidth?: number;
  initialHeight?: number;
  breakpoints?: TBreakpoints;
  debounceMs?: number;
  throttleMs?: number;
  enabled?: boolean;
  useVisualViewport?: boolean;
  round?: boolean;
}

export interface UseWindowSizeReturn<
  TBreakpoints extends WindowSizeBreakpoints,
> extends WindowSizeSnapshot {
  orientation: WindowSizeOrientation;
  isPortrait: boolean;
  isLandscape: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: WindowSizeBreakpointKey<TBreakpoints> | null;
  isAbove: (key: WindowSizeBreakpointKey<TBreakpoints>) => boolean;
  isBelow: (key: WindowSizeBreakpointKey<TBreakpoints>) => boolean;
  isBetween: (
    min: WindowSizeBreakpointKey<TBreakpoints>,
    max: WindowSizeBreakpointKey<TBreakpoints>,
  ) => boolean;
  remountKey: string;
}
