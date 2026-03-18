"use client";

import { useIntersectionObserver } from "@use-kit/client";
import { useRef } from "react";

import styles from "./demo-tokens.module.css";

export function UseIntersectionObserverDemo() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { ref, isIntersecting, hasIntersected, intersectionRatio } =
    useIntersectionObserver<HTMLDivElement>({
      root: rootRef,
      threshold: [0, 0.25, 0.5, 0.75, 1],
    });

  return (
    <div className={styles.root}>
      <p className={styles.muted}>
        Scroll inside the demo area. The observed card updates when it enters the tracked viewport.
      </p>

      <div ref={rootRef} className={styles.scrollRoot}>
        <div className={styles.spacer}>Scroll down</div>
        <div
          ref={ref}
          className={`${styles.scrollObserved} ${
            isIntersecting ? styles.scrollObservedOn : styles.scrollObservedOff
          }`}
        >
          <strong>{isIntersecting ? "Visible in the viewport" : "Outside the viewport"}</strong>
          <span>Intersection ratio: {intersectionRatio.toFixed(2)}</span>
          <span>Seen at least once: {String(hasIntersected)}</span>
        </div>
        <div style={{ height: 220 }} />
      </div>
    </div>
  );
}
