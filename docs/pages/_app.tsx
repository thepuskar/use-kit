import type { AppProps } from "next/app";
import "../styles/index.css";
import "nextra-theme-docs/style.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
