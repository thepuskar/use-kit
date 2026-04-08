"use client";

import * as useKitClient from "@thepuskar/use-kit/client";

import styles from "./demo-tokens.module.css";

const STORAGE_KEY = "use-kit-demo-session-storage";
const DEFAULT_DRAFT = "Ship the docs update.\nAdd tests before lunch.";

type UseSessionStorageHook = <T>(
  key: string,
  initialValue: T | (() => T),
) => {
  value: T;
  setValue: (value: T | ((currentValue: T) => T)) => void;
  remove: () => void;
  reset: () => void;
  isSupported: boolean;
};

const useSessionStorage = (useKitClient as { useSessionStorage?: UseSessionStorageHook })
  .useSessionStorage;

function UseSessionStorageDemoUnavailable() {
  return (
    <div className={styles.root}>
      <div className={styles.between}>
        <div>
          <p className={styles.eyebrow}>Session draft</p>
          <h4 className={styles.title}>sessionStorage-backed state</h4>
        </div>
        <span className={`${styles.pill} ${styles.pillNeutral}`}>Unavailable</span>
      </div>

      <p className={styles.muted}>
        This live demo requires a docs build that resolves the local package source. The API docs
        below still describe the released hook contract.
      </p>
    </div>
  );
}

function UseSessionStorageDemoContent() {
  const useSessionStorageHook = useSessionStorage as UseSessionStorageHook;
  const {
    value: draft,
    setValue,
    remove,
    reset,
    isSupported,
  } = useSessionStorageHook(STORAGE_KEY, DEFAULT_DRAFT);

  return (
    <div className={styles.root}>
      <div className={styles.between}>
        <div>
          <p className={styles.eyebrow}>Session draft</p>
          <h4 className={styles.title}>sessionStorage-backed state</h4>
        </div>
        <span
          className={`${styles.pill} ${draft.trim() ? styles.pillSuccess : styles.pillNeutral}`}
        >
          {draft.trim() ? "Saved for this tab" : "Empty"}
        </span>
      </div>

      <p className={styles.muted}>
        While this tab stays open, navigation and refreshes keep this text. The hook updates React
        state and `sessionStorage` together, with reset and remove helpers for the stored key.
      </p>

      <div className={styles.surface}>
        <textarea
          value={draft}
          onChange={(event) => setValue(event.target.value)}
          rows={5}
          style={{
            width: "100%",
            resize: "vertical",
            borderRadius: 16,
            border: "1px solid var(--uk-demo-border-strong)",
            background: "var(--uk-demo-button-bg)",
            color: "var(--uk-demo-text)",
            padding: "0.9rem 1rem",
            font: "inherit",
            lineHeight: 1.5,
          }}
        />

        <div className={styles.row} style={{ marginTop: "1rem" }}>
          <button
            type="button"
            className={styles.button}
            onClick={() =>
              setValue(
                (currentValue) =>
                  `${currentValue}${currentValue ? "\n" : ""}Review the release checklist.`,
              )
            }
          >
            Append Line
          </button>
          <button type="button" className={styles.button} onClick={reset}>
            Reset
          </button>
          <button type="button" className={styles.button} onClick={remove}>
            Remove Stored Value
          </button>
        </div>

        <p className={styles.meta}>Storage support: {isSupported ? "Available" : "Unavailable"}.</p>
      </div>
    </div>
  );
}

export function UseSessionStorageDemo() {
  return useSessionStorage ? (
    <UseSessionStorageDemoContent />
  ) : (
    <UseSessionStorageDemoUnavailable />
  );
}
