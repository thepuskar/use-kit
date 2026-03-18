"use client";

import { useMutation } from "@use-kit/client";
import { useState } from "react";

import styles from "./demo-tokens.module.css";

type SaveProfileResult = {
  name: string;
  updatedAt: string;
};

export function UseMutationDemo() {
  const [name, setName] = useState("John Doe");
  const { data, error, status, isPending, mutate, reset, abort } = useMutation<
    SaveProfileResult,
    Error,
    string
  >(async (nextName = "", { signal }) => {
    await new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(resolve, 800);

      signal.addEventListener(
        "abort",
        () => {
          clearTimeout(timeoutId);
          reject(new DOMException("Aborted", "AbortError"));
        },
        { once: true },
      );
    });

    if (nextName.trim().length < 3) {
      throw new Error("Name must be at least 3 characters.");
    }

    return {
      name: nextName.trim(),
      updatedAt: new Date().toLocaleTimeString(),
    };
  });

  return (
    <div className={styles.root}>
      <div className={styles.between}>
        <div>
          <p className={styles.eyebrow}>Form submission</p>
          <h4 className={styles.title}>Save profile name</h4>
        </div>
        <span
          className={`${styles.pill} ${
            status === "success" ? styles.pillSuccess : styles.pillNeutral
          }`}
        >
          {status}
        </span>
      </div>

      <p className={styles.muted}>
        This demo uses a local async mutation to model a save button, status badge, validation
        error, and abort control.
      </p>

      <div className={styles.surface}>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Enter profile name"
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
          <button type="button" className={styles.button} onClick={() => mutate(name)}>
            {isPending ? "Saving..." : "Save"}
          </button>
          <button type="button" className={styles.button} onClick={abort}>
            Abort
          </button>
          <button type="button" className={styles.button} onClick={reset}>
            Reset
          </button>
        </div>

        <div style={{ display: "grid", gap: "0.6rem", marginTop: "1rem" }}>
          {data ? (
            <div className={styles.card}>
              <strong>Saved profile</strong>
              <p className={styles.meta}>
                {data.name} at {data.updatedAt}
              </p>
            </div>
          ) : (
            <p className={styles.meta}>No successful mutation yet.</p>
          )}

          {error ? <p className={`${styles.meta} ${styles.danger}`}>{error.message}</p> : null}
        </div>
      </div>
    </div>
  );
}
