"use client";

import { useCopyToClipboard } from "@thepuskar/use-kit/client";
import { useState } from "react";

import styles from "./demo-tokens.module.css";

export function UseCopyToClipboardDemo() {
  const [value, setValue] = useState("npx @thepuskar/use-kit");
  const { copied, copiedText, error, status, copy, reset } = useCopyToClipboard({
    resetTime: 2000,
  });

  return (
    <div className={styles.root}>
      <div className={styles.between}>
        <div>
          <p className={styles.eyebrow}>Clipboard action</p>
          <h4 className={styles.title}>Copy install command</h4>
        </div>
        <span
          className={`${styles.pill} ${
            status === "success" ? styles.pillSuccess : styles.pillNeutral
          }`}
        >
          {copied ? "Copied" : status === "error" ? "Error" : "Idle"}
        </span>
      </div>

      <p className={styles.muted}>
        This is a real UI pattern: one input, one copy button, short-lived success feedback, and a
        reset path for repeated actions.
      </p>

      <div className={styles.surface}>
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Enter text to copy"
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

        <div className={styles.row} style={{ marginTop: "1rem" }}>
          <button type="button" className={styles.button} onClick={() => void copy(value)}>
            {copied ? "Copied" : "Copy"}
          </button>
          <button type="button" className={styles.button} onClick={reset}>
            Reset
          </button>
        </div>

        <div style={{ display: "grid", gap: "0.6rem", marginTop: "1rem" }}>
          {copiedText ? (
            <div className={styles.card}>
              <strong>Last copied text</strong>
              <p className={styles.meta}>{copiedText}</p>
            </div>
          ) : (
            <p className={styles.meta}>Nothing copied yet.</p>
          )}

          {error ? <p className={`${styles.meta} ${styles.danger}`}>{error.message}</p> : null}
        </div>
      </div>
    </div>
  );
}
