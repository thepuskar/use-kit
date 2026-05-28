import type { ClientFeatureRequirement, MissingClientFeature } from "./types";

const STORAGE_TEST_KEY = "__react_rsc_kit_client_only_test__";

export const CLIENT_FEATURES = [
  "window",
  "document",
  "localStorage",
  "sessionStorage",
  "matchMedia",
  "intersectionObserver",
  "resizeObserver",
  "clipboard",
  "geolocation",
] as const satisfies readonly MissingClientFeature[];

function hasStorage(type: "localStorage" | "sessionStorage"): boolean {
  try {
    if (typeof window === "undefined") {
      return false;
    }

    const storage = window[type];

    if (!storage) {
      return false;
    }

    storage.setItem(STORAGE_TEST_KEY, STORAGE_TEST_KEY);
    storage.removeItem(STORAGE_TEST_KEY);
    return true;
  } catch {
    return false;
  }
}

function hasFeature(feature: MissingClientFeature): boolean {
  switch (feature) {
    case "window":
      return typeof window !== "undefined";
    case "document":
      return typeof document !== "undefined";
    case "localStorage":
      return hasStorage("localStorage");
    case "sessionStorage":
      return hasStorage("sessionStorage");
    case "matchMedia":
      return typeof window !== "undefined" && typeof window.matchMedia === "function";
    case "intersectionObserver":
      return typeof window !== "undefined" && typeof window.IntersectionObserver !== "undefined";
    case "resizeObserver":
      return typeof window !== "undefined" && typeof window.ResizeObserver !== "undefined";
    case "clipboard":
      return typeof navigator !== "undefined" && typeof navigator.clipboard !== "undefined";
    case "geolocation":
      return typeof navigator !== "undefined" && typeof navigator.geolocation !== "undefined";
  }
}

export function getClientFeatureRequirementKey(
  requirements: ClientFeatureRequirement | undefined,
): string {
  return CLIENT_FEATURES.map((feature) => (requirements?.[feature] === true ? feature : "")).join(
    "|",
  );
}

export function detectMissingClientFeatures(
  requirements: ClientFeatureRequirement | undefined,
): MissingClientFeature[] {
  if (!requirements) {
    return [];
  }

  return CLIENT_FEATURES.filter(
    (feature) => requirements[feature] === true && !hasFeature(feature),
  );
}
