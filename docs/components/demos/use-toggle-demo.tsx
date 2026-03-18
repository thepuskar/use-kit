"use client";

import { useToggle } from "@thepuskar/use-kit/client";

import styles from "./demo-tokens.module.css";

export function UseToggleDemo() {
  const [enabled, toggle, , { setTrue, setFalse, reset }] = useToggle(false);

  return (
    <div className={styles.root}>
      <div className={styles.between}>
        <div>
          <p className={styles.eyebrow}>Feature flag</p>
          <h4 className={styles.title}>Beta checkout</h4>
        </div>
        <span className={`${styles.pill} ${enabled ? styles.pillSuccess : styles.pillNeutral}`}>
          {enabled ? "Enabled" : "Disabled"}
        </span>
      </div>

      <p className={styles.muted}>
        This is a real usage pattern: one boolean state drives a status badge, explanatory text, and
        small control helpers.
      </p>

      <div className={styles.row}>
        <button type="button" className={styles.button} onClick={() => toggle()}>
          Toggle
        </button>
        <button type="button" className={styles.button} onClick={setTrue}>
          Force On
        </button>
        <button type="button" className={styles.button} onClick={setFalse}>
          Force Off
        </button>
        <button type="button" className={styles.button} onClick={reset}>
          Reset
        </button>
      </div>
    </div>
  );
}
