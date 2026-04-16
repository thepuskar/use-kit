"use client";

import { useOnScreen } from "react-rsc-kit/client";
import { useRef } from "react";

import styles from "./demo-tokens.module.css";

export function UseOnScreenDemo() {
  const scrollRootRef = useRef<HTMLDivElement | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const isVisible = useOnScreen(targetRef, {
    root: scrollRootRef,
    threshold: 0.6,
  });

  return (
    <div className={styles.root}>
      <div className={styles.between}>
        <div>
          <p className={styles.eyebrow}>Boolean visibility</p>
          <h4 className={styles.title}>Is the card on screen?</h4>
        </div>
        <span className={`${styles.pill} ${isVisible ? styles.pillSuccess : styles.pillNeutral}`}>
          {isVisible ? "Visible" : "Not visible"}
        </span>
      </div>

      <p className={styles.muted}>
        Scroll inside the container. This version only gives you a boolean, which is ideal for
        simple reveal or lazy-render decisions.
      </p>

      <div ref={scrollRootRef} className={styles.scrollRoot}>
        <div className={styles.spacer}>Keep scrolling</div>
        <div
          ref={targetRef}
          className={`${styles.scrollObserved} ${
            isVisible ? styles.scrollObservedOn : styles.scrollObservedOff
          }`}
        >
          <strong>{isVisible ? "Section is on screen" : "Section is off screen"}</strong>
          <p style={{ margin: 0 }}>
            {isVisible
              ? "You can trigger lightweight UI changes from this boolean."
              : "Move the card into view to flip the state."}
          </p>
        </div>
        <div className={styles.spacer}>Bottom spacer</div>
      </div>
    </div>
  );
}
