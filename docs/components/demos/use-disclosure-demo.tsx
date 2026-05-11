"use client";

import { useState } from "react";
import { useDisclosure } from "react-rsc-kit/client";

import styles from "./demo-tokens.module.css";

export function UseDisclosureDemo() {
  const detailsDisclosure = useDisclosure({
    defaultOpen: true,
  });
  const [panelOpen, setPanelOpen] = useState(false);
  const panelDisclosure = useDisclosure({
    open: panelOpen,
    onChange: setPanelOpen,
  });

  return (
    <div className={styles.root}>
      <div className={styles.between}>
        <div>
          <p className={styles.eyebrow}>Disclosure state</p>
          <h4 className={styles.title}>Account controls</h4>
        </div>
        <span
          className={`${styles.pill} ${
            panelDisclosure.isOpen ? styles.pillSuccess : styles.pillNeutral
          }`}
        >
          {panelDisclosure.isOpen ? "Panel Open" : "Panel Closed"}
        </span>
      </div>

      <div className={styles.surface}>
        <div className={styles.between}>
          <div>
            <p className={styles.eyebrow}>Uncontrolled section</p>
            <h4 className={styles.title}>Billing details</h4>
          </div>
          <button
            type="button"
            className={`${styles.button} ${detailsDisclosure.isOpen ? styles.buttonActive : ""}`}
            aria-expanded={detailsDisclosure.isOpen}
            onClick={detailsDisclosure.toggle}
          >
            {detailsDisclosure.isOpen ? "Hide" : "Show"}
          </button>
        </div>

        {detailsDisclosure.isOpen ? (
          <p className={styles.muted}>Annual plan, card ending in 4242, renewal on May 18.</p>
        ) : null}
      </div>

      <div className={styles.surface}>
        <div className={styles.between}>
          <div>
            <p className={styles.eyebrow}>Controlled panel</p>
            <h4 className={styles.title}>Security review</h4>
            <p className={styles.meta}>Parent state: {String(panelOpen)}</p>
          </div>
          <div className={styles.row}>
            <button
              type="button"
              className={`${styles.button} ${panelDisclosure.isOpen ? styles.buttonActive : ""}`}
              aria-expanded={panelDisclosure.isOpen}
              onClick={panelDisclosure.open}
            >
              Open
            </button>
            <button type="button" className={styles.button} onClick={panelDisclosure.close}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
