import path from "node:path";
import { fileURLToPath } from "node:url";

import nextra from "nextra";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const docsNodeModules = path.resolve(__dirname, "node_modules");
const useSourceAliases = process.env.USE_KIT_SOURCE === "1";
const webpackAlias = useSourceAliases
  ? {
      react: path.resolve(docsNodeModules, "react"),
      "react-dom": path.resolve(docsNodeModules, "react-dom"),
      "react/jsx-runtime": path.resolve(docsNodeModules, "react/jsx-runtime.js"),
      "react/jsx-dev-runtime": path.resolve(docsNodeModules, "react/jsx-dev-runtime.js"),
      "@thepuskar/use-kit": path.resolve(projectRoot, "src/index.ts"),
      "@thepuskar/use-kit/client": path.resolve(projectRoot, "src/client/index.ts"),
      "@thepuskar/use-kit/hooks": path.resolve(projectRoot, "src/client/hooks.ts"),
      "@thepuskar/use-kit/server": path.resolve(projectRoot, "src/server/index.ts"),
    }
  : null;
const turbopackAlias = useSourceAliases
  ? {
      react: "./docs/node_modules/react",
      "react-dom": "./docs/node_modules/react-dom",
      "react/jsx-runtime": "./docs/node_modules/react/jsx-runtime.js",
      "react/jsx-dev-runtime": "./docs/node_modules/react/jsx-dev-runtime.js",
      "@thepuskar/use-kit": "./src/index.ts",
      "@thepuskar/use-kit/client": "./src/client/index.ts",
      "@thepuskar/use-kit/hooks": "./src/client/hooks.ts",
      "@thepuskar/use-kit/server": "./src/server/index.ts",
    }
  : undefined;
const withNextra = nextra({});

export default withNextra({
  ...(useSourceAliases
    ? {
        experimental: {
          externalDir: true,
        },
      }
    : {}),
  reactStrictMode: true,
  outputFileTracingRoot: useSourceAliases ? projectRoot : __dirname,
  turbopack: {
    root: useSourceAliases ? projectRoot : __dirname,
    ...(turbopackAlias ? { resolveAlias: turbopackAlias } : {}),
  },
  webpack(config) {
    if (webpackAlias) {
      config.resolve.alias = {
        ...config.resolve.alias,
        ...webpackAlias,
      };
    }

    return config;
  },
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
});
