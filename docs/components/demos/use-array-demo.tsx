"use client";

import { useArray } from "react-rsc-kit/client";

import styles from "./demo-tokens.module.css";

const INITIAL_ITEMS = ["React", "Hooks", "Docs"];

export function UseArrayDemo() {
  const { value, length, isEmpty, push, move, removeValue, shuffle, clear, reset } =
    useArray(INITIAL_ITEMS);

  return (
    <div className={styles.root}>
      <div className={styles.between}>
        <div>
          <p className={styles.eyebrow}>Collection state</p>
          <h4 className={styles.title}>Array actions</h4>
        </div>
        <span className={`${styles.pill} ${isEmpty ? styles.pillNeutral : styles.pillSuccess}`}>
          {isEmpty ? "Empty" : `${length} items`}
        </span>
      </div>

      <p className={styles.muted}>
        This is a real stateful use case: the hook owns the list and exposes immutable helpers for
        common collection updates.
      </p>

      <div className={styles.surface}>
        <div className={styles.row}>
          {value.map((item) => (
            <span
              key={item}
              style={{
                borderRadius: 999,
                border: "1px solid var(--uk-demo-border-strong)",
                padding: "0.45rem 0.75rem",
                background: "var(--uk-demo-button-bg)",
                color: "var(--uk-demo-text)",
                fontWeight: 600,
              }}
            >
              {item}
            </span>
          ))}
          {isEmpty ? <p className={styles.meta}>No items left in the collection.</p> : null}
        </div>

        <div className={styles.row} style={{ marginTop: "1rem" }}>
          <button type="button" className={styles.button} onClick={() => push("Utils")}>
            Push
          </button>
          <button type="button" className={styles.button} onClick={() => move(0, -1)}>
            Move First To End
          </button>
          <button type="button" className={styles.button} onClick={() => removeValue("Docs")}>
            Remove Docs
          </button>
          <button type="button" className={styles.button} onClick={shuffle}>
            Shuffle
          </button>
          <button type="button" className={styles.button} onClick={clear}>
            Clear
          </button>
          <button type="button" className={styles.button} onClick={reset}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
