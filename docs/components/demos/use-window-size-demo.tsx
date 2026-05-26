"use client";

import { useWindowSize } from "react-rsc-kit/client";

import styles from "./demo-tokens.module.css";

const dashboardBreakpoints = {
  compact: 480,
  workspace: 900,
  command: 1200,
} as const;

export function UseWindowSizeDemo() {
  const size = useWindowSize({
    breakpoints: dashboardBreakpoints,
    throttleMs: 100,
    round: true,
  });

  return (
    <div className={styles.root}>
      <div className={styles.between}>
        <div>
          <p className={styles.eyebrow}>Viewport</p>
          <h4 className={styles.title}>
            {size.width} x {size.height}
          </h4>
          <p className={styles.meta}>
            visual: {size.visualWidth} x {size.visualHeight} / DPR: {size.devicePixelRatio}
          </p>
        </div>
        <span className={`${styles.pill} ${styles.pillSuccess}`}>
          {size.isClient ? "Client" : "Server"}
        </span>
      </div>

      <div className={styles.surface}>
        <div className={styles.between}>
          <div>
            <p className={styles.eyebrow}>Layout state</p>
            <h4 className={styles.title}>{size.breakpoint ?? "base"}</h4>
            <p className={styles.meta}>
              {size.orientation} / remount key: {size.remountKey}
            </p>
          </div>
          <span
            className={`${styles.pill} ${
              size.isLandscape ? styles.pillSuccess : styles.pillNeutral
            }`}
          >
            {size.isLandscape ? "Landscape" : "Portrait"}
          </span>
        </div>
      </div>

      <div className={styles.row}>
        <span
          className={`${styles.pill} ${size.isMobile ? styles.pillSuccess : styles.pillNeutral}`}
        >
          mobile: {String(size.isMobile)}
        </span>
        <span
          className={`${styles.pill} ${size.isTablet ? styles.pillSuccess : styles.pillNeutral}`}
        >
          tablet: {String(size.isTablet)}
        </span>
        <span
          className={`${styles.pill} ${size.isDesktop ? styles.pillSuccess : styles.pillNeutral}`}
        >
          desktop: {String(size.isDesktop)}
        </span>
      </div>

      <div className={styles.row}>
        <span className={`${styles.pill} ${styles.pillNeutral}`}>
          above workspace: {String(size.isAbove("workspace"))}
        </span>
        <span className={`${styles.pill} ${styles.pillNeutral}`}>
          below command: {String(size.isBelow("command"))}
        </span>
        <span className={`${styles.pill} ${styles.pillNeutral}`}>
          in range: {String(size.isBetween("compact", "command"))}
        </span>
      </div>
    </div>
  );
}
