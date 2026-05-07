"use client";

import { useState } from "react";
import { useControllableState } from "react-rsc-kit/client";

import styles from "./demo-tokens.module.css";

const PLAN_OPTIONS = ["starter", "team", "enterprise"];

export function UseControllableStateDemo() {
  const [parentEnabled, setParentEnabled] = useState(true);
  const [enabled, setEnabled, enabledMeta] = useControllableState<boolean>({
    value: parentEnabled,
    onChange: (nextValue) => setParentEnabled(nextValue),
    name: "NotificationToggle.enabled",
  });
  const [plan, setPlan, planMeta] = useControllableState<string>({
    defaultValue: "team",
    name: "PlanSelect.value",
  });

  return (
    <div className={styles.root}>
      <div className={styles.between}>
        <div>
          <p className={styles.eyebrow}>Design system state</p>
          <h4 className={styles.title}>Controlled and uncontrolled controls</h4>
        </div>
        <span className={`${styles.pill} ${enabled ? styles.pillSuccess : styles.pillNeutral}`}>
          {enabled ? "Notifications On" : "Notifications Off"}
        </span>
      </div>

      <div className={styles.surface}>
        <div className={styles.between}>
          <div>
            <p className={styles.eyebrow}>Controlled toggle</p>
            <h4 className={styles.title}>Parent value: {String(parentEnabled)}</h4>
            <p className={styles.meta}>
              Hook mode: {enabledMeta.isControlled ? "Controlled" : "Uncontrolled"}
            </p>
          </div>

          <button
            type="button"
            className={`${styles.button} ${enabled ? styles.buttonActive : ""}`}
            aria-pressed={enabled ?? false}
            onClick={() => setEnabled((currentValue) => !currentValue)}
          >
            Toggle
          </button>
        </div>
      </div>

      <div className={styles.surface}>
        <div className={styles.between}>
          <div>
            <p className={styles.eyebrow}>Uncontrolled select</p>
            <h4 className={styles.title}>Plan: {plan}</h4>
            <p className={styles.meta}>
              Hook mode: {planMeta.isControlled ? "Controlled" : "Uncontrolled"}
            </p>
          </div>

          <select
            value={plan ?? ""}
            onChange={(event) => setPlan(event.target.value)}
            style={{
              borderRadius: 999,
              border: "1px solid var(--uk-demo-border-strong)",
              background: "var(--uk-demo-button-bg)",
              color: "var(--uk-demo-text)",
              font: "inherit",
              fontWeight: 600,
              padding: "0.6rem 0.9rem",
              textTransform: "capitalize",
            }}
          >
            {PLAN_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
