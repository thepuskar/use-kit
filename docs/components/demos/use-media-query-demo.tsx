"use client";

import { useBreakpoint, useMediaQueries, useMediaQuery } from "react-rsc-kit/client";

import styles from "./demo-tokens.module.css";

export function UseMediaQueryDemo() {
  const desktop = useMediaQuery("(min-width: 1024px)", {
    defaultValue: false,
    ssrValue: false,
  });
  const screens = useMediaQueries({
    mobile: "(max-width: 767px)",
    tablet: "(min-width: 768px) and (max-width: 1023px)",
    desktop: "(min-width: 1024px)",
  });
  const breakpoint = useBreakpoint();

  return (
    <div className={styles.root}>
      <div className={styles.between}>
        <div>
          <p className={styles.eyebrow}>Media query</p>
          <h4 className={styles.title}>Responsive shell</h4>
        </div>
        <span
          className={`${styles.pill} ${desktop.matches ? styles.pillSuccess : styles.pillNeutral}`}
        >
          {desktop.matches ? "Desktop" : "Compact"}
        </span>
      </div>

      <div className={styles.surface}>
        <div className={styles.between}>
          <div>
            <p className={styles.eyebrow}>Current breakpoint</p>
            <h4 className={styles.title}>{breakpoint.breakpoint ?? "base"}</h4>
            <p className={styles.meta}>matchMedia supported: {String(desktop.supported)}</p>
          </div>
          <span
            className={`${styles.pill} ${
              breakpoint.supported ? styles.pillSuccess : styles.pillNeutral
            }`}
          >
            {breakpoint.supported ? "Live" : "Fallback"}
          </span>
        </div>
      </div>

      <div className={styles.row}>
        {Object.entries(screens).map(([name, matches]) => (
          <span
            key={name}
            className={`${styles.pill} ${matches ? styles.pillSuccess : styles.pillNeutral}`}
          >
            {name}: {String(matches)}
          </span>
        ))}
      </div>
    </div>
  );
}
