"use client";

import { Match, Switch } from "@use-kit/client";
import { useMemo, useState } from "react";

import styles from "./demo-tokens.module.css";

type DemoState = "guest" | "loading" | "error" | "member" | "admin";

export function SwitchDemo() {
  const [state, setState] = useState<DemoState>("guest");

  const user = useMemo(() => {
    if (state === "member") {
      return { name: "Ava", role: "member" as const };
    }

    if (state === "admin") {
      return { name: "Ava", role: "admin" as const };
    }

    return null;
  }, [state]);

  const error = state === "error" ? "Request failed. Try again." : null;
  const isLoading = state === "loading";

  return (
    <div className={styles.root}>
      <div className={styles.row}>
        {(["guest", "loading", "error", "member", "admin"] as DemoState[]).map((value) => (
          <button
            key={value}
            type="button"
            className={`${styles.button} ${state === value ? styles.buttonActive : ""}`}
            onClick={() => setState(value)}
          >
            {value}
          </button>
        ))}
      </div>

      <div className={styles.surface} style={{ display: "grid", alignItems: "center" }}>
        <Switch fallback={<div>Please sign in to continue.</div>}>
          <Match when={isLoading}>
            <div>Loading dashboard data...</div>
          </Match>

          <Match when={error}>{(message) => <div className={styles.danger}>{message}</div>}</Match>

          <Match when={() => user?.role === "admin"}>
            <div>
              <strong>Admin mode</strong>
              <p className={styles.meta}>You can access moderation tools and analytics.</p>
            </div>
          </Match>

          <Match when={user}>
            {(value) => (
              <div>
                <strong>Welcome back, {value.name}</strong>
                <p className={styles.meta}>Your member dashboard is ready.</p>
              </div>
            )}
          </Match>
        </Switch>
      </div>
    </div>
  );
}
