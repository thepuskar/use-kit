"use client";

import { useGeolocation } from "@use-kit/client";

import styles from "./demo-tokens.module.css";

export function UseGeolocationDemo() {
  const {
    latitude,
    longitude,
    accuracy,
    loading,
    error,
    isSupported,
    permissionState,
    getCurrentPosition,
  } = useGeolocation({
    watch: false,
    requestOnMount: false,
    enableHighAccuracy: true,
  });

  return (
    <div className={styles.root}>
      <div className={styles.between}>
        <div>
          <p className={styles.eyebrow}>Browser location</p>
          <h4 className={styles.title}>Geolocation lookup</h4>
        </div>
        <span className={`${styles.pill} ${loading ? styles.pillSuccess : styles.pillNeutral}`}>
          {loading ? "Locating..." : (permissionState ?? "Idle")}
        </span>
      </div>

      <p className={styles.muted}>
        This demo does not request location on page load. Click the button to ask for browser
        permission and fetch the current coordinates.
      </p>

      <div className={styles.surface}>
        {!isSupported ? (
          <div>
            <strong>Geolocation is not supported.</strong>
            <p className={styles.meta}>
              This browser environment does not expose the Geolocation API.
            </p>
          </div>
        ) : error ? (
          <div>
            <strong className={styles.danger}>{error.message}</strong>
            <p className={styles.meta}>Coordinates remain visible when a later request fails.</p>
          </div>
        ) : latitude !== null && longitude !== null ? (
          <div>
            <strong>
              {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </strong>
            <p className={styles.meta}>Accuracy: {accuracy ?? "unknown"} meters</p>
          </div>
        ) : (
          <div>
            <strong>No location read yet.</strong>
            <p className={styles.meta}>Run a one-time lookup when you are ready.</p>
          </div>
        )}
      </div>

      <div className={styles.row}>
        <button type="button" className={styles.button} onClick={getCurrentPosition}>
          Get Current Position
        </button>
      </div>
    </div>
  );
}
