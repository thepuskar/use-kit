import path from "node:path";
import { fileURLToPath } from "node:url";

import nextra from "nextra";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const docsNodeModules = path.resolve(__dirname, "node_modules");
const useSourceAliases = process.env.REACT_RSC_KIT_SOURCE !== "0";
const toTurbopackAliasPath = (targetPath) => {
  const relativePath = path.relative(__dirname, targetPath).split(path.sep).join("/");
  return relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
};
const webpackAlias = useSourceAliases
  ? {
      react: path.resolve(docsNodeModules, "react"),
      "react-dom": path.resolve(docsNodeModules, "react-dom"),
      "react/jsx-runtime": path.resolve(docsNodeModules, "react/jsx-runtime.js"),
      "react/jsx-dev-runtime": path.resolve(docsNodeModules, "react/jsx-dev-runtime.js"),
      "react-rsc-kit": path.resolve(projectRoot, "src/index.ts"),
      "react-rsc-kit/client": path.resolve(projectRoot, "src/client/index.ts"),
      "react-rsc-kit/hooks": path.resolve(projectRoot, "src/client/hooks.ts"),
      "react-rsc-kit/server": path.resolve(projectRoot, "src/server/index.ts"),
    }
  : null;
const turbopackAlias = useSourceAliases
  ? {
      react: toTurbopackAliasPath(path.resolve(docsNodeModules, "react")),
      "react-dom": toTurbopackAliasPath(path.resolve(docsNodeModules, "react-dom")),
      "react/jsx-runtime": toTurbopackAliasPath(
        path.resolve(docsNodeModules, "react/jsx-runtime.js"),
      ),
      "react/jsx-dev-runtime": toTurbopackAliasPath(
        path.resolve(docsNodeModules, "react/jsx-dev-runtime.js"),
      ),
      "react-rsc-kit": toTurbopackAliasPath(path.resolve(projectRoot, "src/index.ts")),
      "react-rsc-kit/client": toTurbopackAliasPath(
        path.resolve(projectRoot, "src/client/index.ts"),
      ),
      "react-rsc-kit/hooks": toTurbopackAliasPath(path.resolve(projectRoot, "src/client/hooks.ts")),
      "react-rsc-kit/server": toTurbopackAliasPath(
        path.resolve(projectRoot, "src/server/index.ts"),
      ),
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
