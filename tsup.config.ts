import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    client: "src/client/index.ts",
    server: "src/server/index.ts",
    hooks: "src/client/hooks.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "es2020",
  outDir: "dist",
  external: ["react", "react-dom"],
  tsconfig: "./tsconfig.build.json",
});
