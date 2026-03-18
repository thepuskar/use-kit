"use client";

import { useThrottle } from "@thepuskar/use-kit/client";
import { useState } from "react";

import styles from "./demo-tokens.module.css";

export function UseThrottleDemo() {
  const [query, setQuery] = useState("");
  const throttledQuery = useThrottle(query, 500);

  return (
    <div className={styles.root}>
      <div className={styles.between}>
        <div>
          <p className={styles.eyebrow}>Rate-limited updates</p>
          <h4 className={styles.title}>Throttled query</h4>
        </div>
        <span
          className={`${styles.pill} ${
            query === throttledQuery ? styles.pillNeutral : styles.pillSuccess
          }`}
        >
          {query === throttledQuery ? "Caught up" : "Lagging"}
        </span>
      </div>

      <p className={styles.muted}>
        Type continuously and the throttled value will update at a steady cadence instead of waiting
        for complete idle time.
      </p>

      <div className={styles.surface}>
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Type quickly to see throttling"
          style={{
            width: "100%",
            borderRadius: 12,
            border: "1px solid var(--uk-demo-border-strong)",
            background: "var(--uk-demo-button-bg)",
            color: "var(--uk-demo-text)",
            padding: "0.8rem 0.9rem",
            outline: "none",
          }}
        />

        <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.9rem" }}>
          <div>
            <strong>Raw input</strong>
            <p className={styles.meta}>{query || "Nothing typed yet"}</p>
          </div>
          <div>
            <strong>Throttled value</strong>
            <p className={styles.meta}>{throttledQuery || "Nothing emitted yet"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
