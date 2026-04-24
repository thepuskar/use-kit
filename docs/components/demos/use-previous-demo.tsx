"use client";

import { useState } from "react";
import { usePrevious } from "react-rsc-kit/client";

import styles from "./demo-tokens.module.css";

const PROFILES = ["Frontend", "Platform"] as const;

export function UsePreviousDemo() {
  const [profileIndex, setProfileIndex] = useState(0);
  const [score, setScore] = useState(42);
  const profile = PROFILES[profileIndex];
  const previousScore = usePrevious(score, {
    initialValue: null,
    resetKeys: [profile],
  });
  const hasPreviousScore = previousScore !== null;
  const scoreDelta = hasPreviousScore ? score - previousScore : 0;

  return (
    <div className={styles.root}>
      <div className={styles.between}>
        <div>
          <p className={styles.eyebrow}>Previous value tracking</p>
          <h4 className={styles.title}>{profile} score</h4>
        </div>
        <span
          className={`${styles.pill} ${scoreDelta > 0 ? styles.pillSuccess : styles.pillNeutral}`}
        >
          {hasPreviousScore ? `${scoreDelta >= 0 ? "+" : ""}${scoreDelta}` : "No previous"}
        </span>
      </div>

      <p className={styles.muted}>
        Change the score to compare it with the last committed value. Switching profiles resets the
        previous value boundary with `resetKeys`.
      </p>

      <div className={styles.surface}>
        <div
          style={{
            display: "grid",
            gap: "0.75rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          }}
        >
          <div className={styles.card}>
            <strong>Current score</strong>
            <p className={styles.meta}>{score}</p>
          </div>
          <div className={styles.card}>
            <strong>Previous score</strong>
            <p className={styles.meta}>{hasPreviousScore ? previousScore : "None for profile"}</p>
          </div>
        </div>

        <div className={styles.row} style={{ marginTop: "1rem" }}>
          <button
            type="button"
            className={styles.button}
            onClick={() => setScore((value) => value - 5)}
          >
            Decrease
          </button>
          <button
            type="button"
            className={styles.button}
            onClick={() => setScore((value) => value + 5)}
          >
            Increase
          </button>
          <button
            type="button"
            className={styles.button}
            onClick={() => {
              setProfileIndex((value) => (value + 1) % PROFILES.length);
              setScore((value) => value + 8);
            }}
          >
            Switch Profile
          </button>
        </div>
      </div>
    </div>
  );
}
