"use client";

import { useClickOutside } from "@use-kit/client";
import { useState } from "react";

import styles from "./demo-tokens.module.css";

export function UseClickOutsideDemo() {
  const [open, setOpen] = useState(false);
  const triggerRef = useClickOutside<HTMLDivElement>(
    () => {
      setOpen(false);
    },
    {
      refs: [],
      events: ["pointerdown", "focusin"],
      disabled: !open,
    },
  );

  return (
    <div className={styles.root}>
      <div className={styles.between}>
        <div>
          <p className={styles.eyebrow}>Dismissable UI</p>
          <h4 className={styles.title}>Outside interaction closes the panel</h4>
        </div>
        <span className={`${styles.pill} ${open ? styles.pillSuccess : styles.pillNeutral}`}>
          {open ? "Open" : "Closed"}
        </span>
      </div>

      <p className={styles.muted}>
        Open the panel, then click or focus anywhere outside it. This is the common dropdown and
        popover dismissal pattern.
      </p>

      <div className={styles.row}>
        <button type="button" className={styles.button} onClick={() => setOpen((value) => !value)}>
          {open ? "Hide Panel" : "Show Panel"}
        </button>
      </div>

      <div className={styles.surface}>
        {open ? (
          <div ref={triggerRef} className={styles.card}>
            <strong>Command panel</strong>
            <p className={styles.meta}>Click outside this box to close it.</p>
          </div>
        ) : (
          <p className={styles.meta}>The panel is closed.</p>
        )}
      </div>
    </div>
  );
}
