"use client";

import { useDebounce } from "@use-kit/client";
import { useState } from "react";

import styles from "./demo-tokens.module.css";

export function UseDebounceDemo() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  return (
    <div className={styles.root}>
      <div className={styles.between}>
        <div>
          <p className={styles.eyebrow}>Delayed search input</p>
          <h4 className={styles.title}>Debounced query</h4>
        </div>
        <span
          className={`${styles.pill} ${
            query === debouncedQuery ? styles.pillNeutral : styles.pillSuccess
          }`}
        >
          {query === debouncedQuery ? "Settled" : "Waiting"}
        </span>
      </div>

      <p className={styles.muted}>
        Type into the field and notice that the debounced value only updates after typing settles.
      </p>

      <div className={styles.surface}>
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search hooks, docs, or utilities"
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
            <strong>Debounced value</strong>
            <p className={styles.meta}>{debouncedQuery || "Nothing settled yet"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
