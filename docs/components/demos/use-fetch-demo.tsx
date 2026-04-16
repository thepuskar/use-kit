"use client";

import { useFetch } from "react-rsc-kit/client";

import styles from "./demo-tokens.module.css";

type Post = {
  id: number;
  title: string;
};

export function UseFetchDemo() {
  const { data, error, loading, status, refetch, abort } = useFetch<Post[]>(
    "https://jsonplaceholder.typicode.com/posts?_limit=3",
    undefined,
    {
      enabled: false,
      cacheTime: 30_000,
    },
  );

  return (
    <div className={styles.root}>
      <div className={styles.between}>
        <div>
          <p className={styles.eyebrow}>Manual request flow</p>
          <h4 className={styles.title}>Fetch posts on demand</h4>
        </div>
        <span
          className={`${styles.pill} ${
            status === "error"
              ? styles.pillNeutral
              : status === "success"
                ? styles.pillSuccess
                : styles.pillNeutral
          }`}
        >
          {status}
        </span>
      </div>

      <p className={styles.muted}>
        This demo uses `enabled: false`, manual `refetch()`, and a short cache window. For more
        advanced query orchestration, use TanStack Query.
      </p>

      <div className={styles.row}>
        <button type="button" className={styles.button} onClick={() => void refetch()}>
          Load Posts
        </button>
        <button type="button" className={styles.button} onClick={abort}>
          Abort
        </button>
      </div>

      <div className={styles.surface}>
        {loading ? <p className={styles.meta}>Loading posts...</p> : null}

        {!loading && error ? (
          <p className={`${styles.meta} ${styles.danger}`}>{error.message}</p>
        ) : null}

        {!loading && !error && data ? (
          <div style={{ display: "grid", gap: "0.65rem" }}>
            {data.map((post) => (
              <div key={post.id} className={styles.card}>
                <strong>#{post.id}</strong>
                <p className={styles.meta}>{post.title}</p>
              </div>
            ))}
          </div>
        ) : null}

        {!loading && !error && !data ? (
          <p className={styles.meta}>No request has been run yet.</p>
        ) : null}
      </div>
    </div>
  );
}
