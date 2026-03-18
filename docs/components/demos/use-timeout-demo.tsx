"use client";

import { useTimeout } from "@thepuskar/use-kit/client";
import { useState } from "react";

import styles from "./demo-tokens.module.css";

export function UseTimeoutDemo() {
  const [visible, setVisible] = useState(true);
  const [cycle, setCycle] = useState(1);

  const { start, clear, reset, isPending } = useTimeout(
    () => {
      setVisible(false);
    },
    4000,
    {
      autoStart: false,
    },
  );

  const armBanner = () => {
    setVisible(true);
    setCycle((value) => value + 1);
    start();
  };

  const restartBanner = () => {
    setVisible(true);
    reset();
  };

  return (
    <div className={styles.root}>
      <div className={styles.between}>
        <div>
          <p className={styles.eyebrow}>Auto-dismiss message</p>
          <h4 className={styles.title}>Banner cycle {cycle}</h4>
        </div>
        <span className={`${styles.pill} ${isPending ? styles.pillSuccess : styles.pillNeutral}`}>
          {isPending ? "Timer running" : "Idle"}
        </span>
      </div>

      <div className={styles.surface}>
        {visible ? (
          <div>
            <strong>Workspace synced successfully.</strong>
            <p className={styles.meta}>
              This banner dismisses after 4 seconds when the timer is armed.
            </p>
          </div>
        ) : (
          <div>
            <strong>Banner hidden.</strong>
            <p className={styles.meta}>Arm the timer again to show it and start a new countdown.</p>
          </div>
        )}
      </div>

      <div className={styles.row}>
        <button type="button" className={styles.button} onClick={armBanner}>
          Start
        </button>
        <button type="button" className={styles.button} onClick={restartBanner}>
          Reset
        </button>
        <button type="button" className={styles.button} onClick={clear}>
          Clear
        </button>
      </div>
    </div>
  );
}
