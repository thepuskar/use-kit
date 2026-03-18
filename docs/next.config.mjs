import path from "node:path";
import { fileURLToPath } from "node:url";

import nextra from "nextra";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webpackAlias = {
  react: path.resolve(__dirname, "node_modules/react"),
  "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
  "react/jsx-runtime": path.resolve(__dirname, "node_modules/react/jsx-runtime.js"),
  "react/jsx-dev-runtime": path.resolve(__dirname, "node_modules/react/jsx-dev-runtime.js"),
  "@thepuskar/use-kit": path.resolve(__dirname, "../src/index.ts"),
  "@thepuskar/use-kit/client": path.resolve(__dirname, "../src/client/index.ts"),
  "@thepuskar/use-kit/hooks": path.resolve(__dirname, "../src/client/hooks.ts"),
  "@thepuskar/use-kit/server": path.resolve(__dirname, "../src/server/index.ts"),
  "@use-kit": path.resolve(__dirname, "../src/index.ts"),
  "@use-kit/client": path.resolve(__dirname, "../src/client/index.ts"),
  "@use-kit/hooks": path.resolve(__dirname, "../src/client/hooks.ts"),
  "@use-kit/server": path.resolve(__dirname, "../src/server/index.ts"),
};
const turbopackAlias = {
  react: "./node_modules/react",
  "react-dom": "./node_modules/react-dom",
  "react/jsx-runtime": "./node_modules/react/jsx-runtime.js",
  "react/jsx-dev-runtime": "./node_modules/react/jsx-dev-runtime.js",
  "@thepuskar/use-kit": "../src/index.ts",
  "@thepuskar/use-kit/client": "../src/client/index.ts",
  "@thepuskar/use-kit/hooks": "../src/client/hooks.ts",
  "@thepuskar/use-kit/server": "../src/server/index.ts",
  "@use-kit": "../src/index.ts",
  "@use-kit/client": "../src/client/index.ts",
  "@use-kit/hooks": "../src/client/hooks.ts",
  "@use-kit/server": "../src/server/index.ts",
};

const withNextra = nextra({});

export default withNextra({
  experimental: {
    externalDir: true,
  },
  reactStrictMode: true,
  turbopack: {
    root: path.resolve(__dirname, ".."),
    resolveAlias: turbopackAlias,
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      ...webpackAlias,
    };

    return config;
  },
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
});
