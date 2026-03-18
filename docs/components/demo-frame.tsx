import { ReactNode } from "react";

import styles from "./demo-frame.module.css";

interface DemoFrameProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function DemoFrame({ title, description, children }: DemoFrameProps) {
  return (
    <section className={styles.demoFrame}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Live Example</p>
        <h3 className={styles.title}>{title}</h3>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      <div className={styles.preview}>
        <div className={styles.canvas}>{children}</div>
      </div>
    </section>
  );
}
