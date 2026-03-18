import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useGeolocation } from "../src/client/hooks";

type SuccessHandler = PositionCallback | null;
type ErrorHandler = PositionErrorCallback | null;
type MockPositionOverrides = Partial<{
  accuracy: number | null;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
  timestamp: number;
}>;

function createPosition(overrides: MockPositionOverrides = {}): GeolocationPosition {
  return {
    coords: {
      accuracy: overrides.accuracy ?? 10,
      altitude: overrides.altitude ?? null,
      altitudeAccuracy: overrides.altitudeAccuracy ?? null,
      heading: overrides.heading ?? null,
      latitude: overrides.latitude ?? 27.7172,
      longitude: overrides.longitude ?? 85.324,
      speed: overrides.speed ?? null,
      toJSON: () => ({}),
    },
    timestamp: overrides.timestamp ?? 1234,
    toJSON: () => ({}),
  } as GeolocationPosition;
}

function createPositionError(code = 1, message = "Permission denied"): GeolocationPositionError {
  return {
    code,
    message,
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
  } as GeolocationPositionError;
}

class MockGeolocation {
  getCurrentSuccess: SuccessHandler = null;
  getCurrentError: ErrorHandler = null;
  watchSuccess: SuccessHandler = null;
  watchError: ErrorHandler = null;

  getCurrentPosition = vi.fn((success: PositionCallback, error?: PositionErrorCallback | null) => {
    this.getCurrentSuccess = success;
    this.getCurrentError = error ?? null;
  });

  watchPosition = vi.fn((success: PositionCallback, error?: PositionErrorCallback | null) => {
    this.watchSuccess = success;
    this.watchError = error ?? null;
    return 42;
  });

  clearWatch = vi.fn();

  emitCurrent(position: GeolocationPosition) {
    this.getCurrentSuccess?.(position);
  }

  emitWatch(position: GeolocationPosition) {
    this.watchSuccess?.(position);
  }

  emitError(error: GeolocationPositionError) {
    this.getCurrentError?.(error);
    this.watchError?.(error);
  }
}

const originalGeolocation = navigator.geolocation;
const originalPermissions = navigator.permissions;

describe("useGeolocation", () => {
  let geolocation: MockGeolocation;

  beforeEach(() => {
    geolocation = new MockGeolocation();

    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: geolocation,
    });

    Object.defineProperty(navigator, "permissions", {
      configurable: true,
      value: {
        query: vi.fn(async () => ({ state: "granted" })),
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: originalGeolocation,
    });

    Object.defineProperty(navigator, "permissions", {
      configurable: true,
      value: originalPermissions,
    });
  });

  it("requests current position and starts watching by default", async () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useGeolocation({}, callback));

    expect(geolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
    expect(geolocation.watchPosition).toHaveBeenCalledTimes(1);
    expect(result.current.loading).toBe(true);
    expect(result.current.isWatching).toBe(true);

    act(() => {
      geolocation.emitCurrent(
        createPosition({
          latitude: 40.7128,
          longitude: -74.006,
          timestamp: 999,
        }),
      );
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.latitude).toBe(40.7128);
    expect(result.current.longitude).toBe(-74.006);
    expect(result.current.timestamp).toBe(999);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        latitude: 40.7128,
        longitude: -74.006,
        error: null,
      }),
    );
  });

  it("supports watch-less manual current position requests", async () => {
    const { result } = renderHook(() =>
      useGeolocation({
        watch: false,
        requestOnMount: false,
      }),
    );

    expect(geolocation.getCurrentPosition).not.toHaveBeenCalled();
    expect(geolocation.watchPosition).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.isWatching).toBe(false);

    act(() => {
      result.current.getCurrentPosition();
    });

    expect(geolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
    expect(result.current.loading).toBe(true);

    act(() => {
      geolocation.emitCurrent(createPosition({ latitude: 51.5072, longitude: -0.1276 }));
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.latitude).toBe(51.5072);
    expect(result.current.longitude).toBe(-0.1276);
  });

  it("clears the active watch via cancel", () => {
    const { result } = renderHook(() => useGeolocation());

    expect(result.current.isWatching).toBe(true);

    act(() => {
      result.current.cancel();
    });

    expect(geolocation.clearWatch).toHaveBeenCalledWith(42);
    expect(result.current.isWatching).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it("preserves the last known coordinates when an error occurs", async () => {
    const { result } = renderHook(() => useGeolocation());

    act(() => {
      geolocation.emitCurrent(createPosition({ latitude: 12.34, longitude: 56.78 }));
    });

    await waitFor(() => {
      expect(result.current.latitude).toBe(12.34);
    });

    const error = createPositionError();

    act(() => {
      geolocation.emitError(error);
    });

    await waitFor(() => {
      expect(result.current.error).toBe(error);
    });

    expect(result.current.latitude).toBe(12.34);
    expect(result.current.longitude).toBe(56.78);
  });

  it("exposes permission state when the Permissions API is available", async () => {
    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => {
      expect(result.current.permissionState).toBe("granted");
    });
  });

  it("reports unsupported environments cleanly", () => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: undefined,
    });

    const { result } = renderHook(() => useGeolocation());

    expect(result.current.isSupported).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.isWatching).toBe(false);
  });
});
