import type { ReactNode } from "react";

export type ClientOnlyStrategy = "effect" | "idle" | "animation-frame";

export type ClientFeatureRequirement = {
  window?: boolean;
  document?: boolean;
  localStorage?: boolean;
  sessionStorage?: boolean;
  matchMedia?: boolean;
  intersectionObserver?: boolean;
  resizeObserver?: boolean;
  clipboard?: boolean;
  geolocation?: boolean;
};

export type MissingClientFeature = keyof ClientFeatureRequirement;

export type ClientOnlyState = {
  isClient: boolean;
  isReady: boolean;
  isSupported: boolean;
  missingFeatures: MissingClientFeature[];
};

export type ClientOnlyChildren = ReactNode | ((state: ClientOnlyState) => ReactNode);

export type ClientOnlyProps = {
  children: ClientOnlyChildren;
  fallback?: ReactNode;
  unsupportedFallback?: ReactNode | ((missingFeatures: MissingClientFeature[]) => ReactNode);
  delay?: number;
  strategy?: ClientOnlyStrategy;
  require?: ClientFeatureRequirement;
  suppressHydrationWarning?: boolean;
  onReady?: () => void;
  onUnsupported?: (missingFeatures: MissingClientFeature[]) => void;
  onError?: (error: unknown) => void;
};
