import path from "node:path";
import { fileURLToPath } from "node:url";

import nextra from "nextra";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const docsNodeModules = path.resolve(__dirname, "node_modules");
const sourceRoot = path.resolve(projectRoot, "src");
const toProjectRelativePath = (targetPath) => {
  const relativePath = path.relative(projectRoot, targetPath).replace(/\\/g, "/");

  return relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
};
const aliasTargets = {
  react: path.resolve(docsNodeModules, "react"),
  "react-dom": path.resolve(docsNodeModules, "react-dom"),
  "react/jsx-runtime": path.resolve(docsNodeModules, "react/jsx-runtime.js"),
  "react/jsx-dev-runtime": path.resolve(docsNodeModules, "react/jsx-dev-runtime.js"),
  "@thepuskar/use-kit": path.resolve(sourceRoot, "index.ts"),
  "@thepuskar/use-kit/client": path.resolve(sourceRoot, "client/index.ts"),
  "@thepuskar/use-kit/hooks": path.resolve(sourceRoot, "client/hooks.ts"),
  "@thepuskar/use-kit/server": path.resolve(sourceRoot, "server/index.ts"),
  "@use-kit": path.resolve(sourceRoot, "index.ts"),
  "@use-kit/client": path.resolve(sourceRoot, "client/index.ts"),
  "@use-kit/hooks": path.resolve(sourceRoot, "client/hooks.ts"),
  "@use-kit/server": path.resolve(sourceRoot, "server/index.ts"),
};
const webpackAlias = aliasTargets;
const turbopackAlias = Object.fromEntries(
  Object.entries(aliasTargets).map(([key, targetPath]) => [key, toProjectRelativePath(targetPath)]),
);

const withNextra = nextra({});

export default withNextra({
  experimental: {
    externalDir: true,
  },
  reactStrictMode: true,
  turbopack: {
    root: projectRoot,
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
