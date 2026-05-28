"use client";

import { ClientOnly } from "react-rsc-kit/client";

import styles from "./demo-tokens.module.css";

function BrowserWidth() {
  return <span>{window.innerWidth}px wide</span>;
}

export function ClientOnlyDemo() {
  return (
    <div className={styles.root}>
      <div className={styles.surface}>
        <p className={styles.eyebrow}>Basic ClientOnly</p>
        <ClientOnly fallback={<span className={styles.muted}>Preparing client UI...</span>}>
          <strong>Client content mounted.</strong>
        </ClientOnly>
      </div>

      <div className={styles.surface}>
        <p className={styles.eyebrow}>Fallback</p>
        <ClientOnly
          fallback={<span aria-busy="true">Loading the browser-only panel...</span>}
          delay={500}
        >
          <strong>Browser-only panel is ready.</strong>
        </ClientOnly>
      </div>

      <div className={styles.surface}>
        <p className={styles.eyebrow}>Delay</p>
        <ClientOnly
          fallback={<span className={styles.muted}>Delaying for 900ms...</span>}
          delay={900}
        >
          <strong>Delay completed.</strong>
        </ClientOnly>
      </div>

      <div className={styles.surface}>
        <p className={styles.eyebrow}>Function children</p>
        <ClientOnly
          fallback={<span className={styles.muted}>Waiting for mount...</span>}
          delay={400}
        >
          {({ isClient, isReady, isSupported }) => (
            <span>
              {isClient && isSupported && isReady ? "Render-prop state is ready." : "Resolving..."}
            </span>
          )}
        </ClientOnly>
      </div>

      <div className={styles.surface}>
        <p className={styles.eyebrow}>Requires localStorage</p>
        <ClientOnly
          fallback={<span className={styles.muted}>Checking storage support...</span>}
          unsupportedFallback={(missingFeatures) => (
            <span className={styles.danger}>Missing: {missingFeatures.join(", ")}</span>
          )}
          require={{
            localStorage: true,
          }}
        >
          <strong>localStorage is available.</strong>
        </ClientOnly>
      </div>

      <div className={styles.surface}>
        <p className={styles.eyebrow}>Requires matchMedia</p>
        <ClientOnly
          fallback={<span className={styles.muted}>Checking media query support...</span>}
          unsupportedFallback={(missingFeatures) => (
            <span className={styles.danger}>Missing: {missingFeatures.join(", ")}</span>
          )}
          require={{
            matchMedia: true,
          }}
        >
          <strong>matchMedia is available.</strong>
        </ClientOnly>
      </div>

      <div className={styles.surface}>
        <p className={styles.eyebrow}>Unsupported fallback</p>
        <ClientOnly
          fallback={<span className={styles.muted}>Checking optional browser APIs...</span>}
          unsupportedFallback={(missingFeatures) => (
            <span className={styles.danger}>
              Unsupported in this browser: {missingFeatures.join(", ")}
            </span>
          )}
          require={{
            clipboard: true,
            geolocation: true,
          }}
        >
          <strong>Clipboard and geolocation APIs are available.</strong>
        </ClientOnly>
      </div>

      <div className={styles.surface}>
        <p className={styles.eyebrow}>Idle strategy</p>
        <ClientOnly
          fallback={<span className={styles.muted}>Waiting for idle time...</span>}
          strategy="idle"
        >
          <strong>Rendered from an idle callback.</strong>
        </ClientOnly>
      </div>

      <div className={styles.surface}>
        <p className={styles.eyebrow}>Animation frame strategy</p>
        <ClientOnly
          fallback={<span className={styles.muted}>Waiting for the next frame...</span>}
          strategy="animation-frame"
        >
          <strong>Rendered on an animation frame.</strong>
        </ClientOnly>
      </div>

      <div className={styles.surface}>
        <p className={styles.eyebrow}>Hydration-safe browser width</p>
        <ClientOnly fallback={<span className={styles.muted}>Measuring after hydration...</span>}>
          {({ isReady }) => (isReady ? <BrowserWidth /> : <span>Measuring...</span>)}
        </ClientOnly>
      </div>
    </div>
  );
}
