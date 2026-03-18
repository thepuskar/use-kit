import { useCallback, useEffect, useRef, useState } from "react";

type PositionError = GeolocationPositionError;

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  maximumAge?: number;
  timeout?: number;
  watch?: boolean;
  requestOnMount?: boolean;
}

export interface GeolocationCoordinates {
  accuracy: number | null;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
  timestamp: number | null;
  error: PositionError | null;
}

interface GeolocationState extends GeolocationCoordinates {
  loading: boolean;
  permissionState: PermissionState | null;
  isWatching: boolean;
}

export interface UseGeolocationResult extends GeolocationCoordinates {
  loading: boolean;
  permissionState: PermissionState | null;
  isSupported: boolean;
  isEnabled: boolean;
  isWatching: boolean;
  getCurrentPosition: () => void;
  cancel: () => void;
}

const EMPTY_COORDINATES: GeolocationCoordinates = {
  accuracy: null,
  altitude: null,
  altitudeAccuracy: null,
  heading: null,
  latitude: null,
  longitude: null,
  speed: null,
  timestamp: null,
  error: null,
};

function isGeolocationSupported(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.geolocation !== "undefined";
}

function getInitialState(loading: boolean): GeolocationState {
  return {
    ...EMPTY_COORDINATES,
    loading,
    permissionState: null,
    isWatching: false,
  };
}

function toCoordinates({ coords, timestamp }: GeolocationPosition): GeolocationCoordinates {
  return {
    accuracy: coords.accuracy,
    altitude: coords.altitude,
    altitudeAccuracy: coords.altitudeAccuracy,
    heading: coords.heading,
    latitude: coords.latitude,
    longitude: coords.longitude,
    speed: coords.speed,
    timestamp,
    error: null,
  };
}

/**
 * Read the browser Geolocation API with optional watching and manual refresh.
 */
export function useGeolocation(
  options: GeolocationOptions = {},
  callback?: (coordinates: GeolocationCoordinates) => void,
  isEnabled = true,
): UseGeolocationResult {
  const { enableHighAccuracy, maximumAge, timeout, watch = true, requestOnMount = true } = options;

  const supported = isGeolocationSupported();
  const shouldStartPending = isEnabled && supported && (watch || requestOnMount);

  const [state, setState] = useState<GeolocationState>(() => getInitialState(shouldStartPending));

  const callbackRef = useRef(callback);
  const watchIdRef = useRef<number | null>(null);
  const mountedRef = useRef(false);

  const clearWatch = useCallback(() => {
    if (watchIdRef.current !== null && isGeolocationSupported()) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const updateState = useCallback((updater: (previous: GeolocationState) => GeolocationState) => {
    if (!mountedRef.current) {
      return;
    }

    setState(updater);
  }, []);

  const handleSuccess = useCallback(
    (position: GeolocationPosition) => {
      const nextCoordinates = toCoordinates(position);

      updateState((previous) => ({
        ...previous,
        ...nextCoordinates,
        loading: false,
        isWatching: watchIdRef.current !== null,
      }));

      callbackRef.current?.(nextCoordinates);
    },
    [updateState],
  );

  const handleError = useCallback(
    (error: PositionError) => {
      updateState((previous) => ({
        ...previous,
        error,
        loading: false,
        isWatching: watchIdRef.current !== null,
      }));
    },
    [updateState],
  );

  const getCurrentPosition = useCallback(() => {
    if (!isEnabled) {
      return;
    }

    if (!isGeolocationSupported()) {
      updateState((previous) => ({
        ...previous,
        loading: false,
        isWatching: false,
      }));
      return;
    }

    updateState((previous) => ({
      ...previous,
      loading: true,
    }));

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy,
      maximumAge,
      timeout,
    });
  }, [enableHighAccuracy, handleError, handleSuccess, isEnabled, maximumAge, timeout, updateState]);

  const cancel = useCallback(() => {
    clearWatch();
    updateState((previous) => ({
      ...previous,
      loading: false,
      isWatching: false,
    }));
  }, [clearWatch, updateState]);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!supported || typeof navigator.permissions?.query !== "function") {
      return;
    }

    let cancelled = false;

    void navigator.permissions
      .query({ name: "geolocation" })
      .then((status) => {
        if (cancelled) {
          return;
        }

        updateState((previous) => ({
          ...previous,
          permissionState: status.state,
        }));
      })
      .catch(() => {
        // Ignore permission-query failures and keep the hook usable.
      });

    return () => {
      cancelled = true;
    };
  }, [supported, updateState]);

  useEffect(() => {
    clearWatch();

    if (!isEnabled) {
      updateState((previous) => ({
        ...previous,
        loading: false,
        isWatching: false,
      }));
      return;
    }

    if (!supported) {
      updateState((previous) => ({
        ...previous,
        loading: false,
        isWatching: false,
      }));
      return;
    }

    updateState((previous) => ({
      ...previous,
      loading: watch || requestOnMount,
      isWatching: false,
    }));

    if (watch) {
      watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, {
        enableHighAccuracy,
        maximumAge,
        timeout,
      });

      updateState((previous) => ({
        ...previous,
        isWatching: true,
      }));
    }

    if (requestOnMount) {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
        enableHighAccuracy,
        maximumAge,
        timeout,
      });
    }

    return clearWatch;
  }, [
    clearWatch,
    enableHighAccuracy,
    handleError,
    handleSuccess,
    isEnabled,
    maximumAge,
    requestOnMount,
    supported,
    timeout,
    updateState,
    watch,
  ]);

  return {
    ...state,
    isSupported: supported,
    isEnabled,
    getCurrentPosition,
    cancel,
  };
}
