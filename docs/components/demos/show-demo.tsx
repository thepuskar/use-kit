"use client";

import { Show } from "react-rsc-kit";
import { useMemo, useState } from "react";

import styles from "./demo-tokens.module.css";

type DemoState = "empty" | "user";

export function ShowDemo() {
  const [state, setState] = useState<DemoState>("empty");

  const user = useMemo(() => {
    if (state === "user") {
      return { name: "Ava", plan: "pro" as const };
    }

    return null;
  }, [state]);

  return (
    <div className={styles.root}>
      <div className={styles.row}>
        {(["empty", "user"] as DemoState[]).map((value) => (
          <button
            key={value}
            type="button"
            className={`${styles.button} ${state === value ? styles.buttonActive : ""}`}
            onClick={() => setState(value)}
          >
            {value === "empty" ? "No user" : "Signed in"}
          </button>
        ))}
      </div>

      <div className={styles.surface} style={{ display: "grid", alignItems: "center" }}>
        <Show
          when={user}
          fallback={<div className={styles.muted}>Please sign in to continue.</div>}
        >
          {(value) => (
            <div>
              <strong>Welcome, {value.name}</strong>
              <p className={styles.meta}>Plan: {value.plan}</p>
            </div>
          )}
        </Show>
      </div>
    </div>
  );
}
