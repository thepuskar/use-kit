"use client";

import { For } from "@use-kit/client";
import { useState } from "react";

import styles from "./demo-tokens.module.css";

const products = [
  { id: "p1", name: "Keyboard", stock: "In stock" },
  { id: "p2", name: "Trackpad", stock: "Backorder" },
  { id: "p3", name: "Monitor arm", stock: "In stock" },
];

export function ForDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [showItems, setShowItems] = useState(true);

  return (
    <div className={styles.root}>
      <div className={styles.row}>
        <button
          type="button"
          className={styles.button}
          onClick={() => setIsLoading((value) => !value)}
        >
          Toggle Loading
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={() => setShowItems((value) => !value)}
        >
          Toggle Empty State
        </button>
      </div>

      <For
        each={showItems ? products : []}
        getKey={(item) => item.id}
        isLoading={isLoading}
        loading={() => <div>Loading products...</div>}
        empty={() => <div>No products available right now.</div>}
        as="div"
        wrapperProps={{
          style: {
            display: "grid",
            gap: "0.75rem",
          },
        }}
      >
        {(item) => (
          <div className={styles.card}>
            <strong>{item.name}</strong>
            <p className={styles.meta}>{item.stock}</p>
          </div>
        )}
      </For>
    </div>
  );
}
