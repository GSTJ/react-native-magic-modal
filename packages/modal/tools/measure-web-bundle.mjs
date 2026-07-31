import { gzipSync } from "node:zlib";

import { build } from "esbuild";

/**
 * What a web app actually downloads for this package.
 *
 * The published browser entry still imports from `react-native`, which a web
 * bundler aliases to `react-native-web`, so the file size on disk says nothing
 * about the cost. Bundling it the way a real app does — alias applied, React
 * external because the app already has it, production defines so dev-only
 * branches drop — is the only number worth budgeting against.
 */
export const measureWebBundle = async ({
  entry = new URL("../dist/index.js", import.meta.url).pathname,
} = {}) => {
  const result = await build({
    alias: { "react-native": "react-native-web" },
    bundle: true,
    define: {
      __DEV__: "false",
      "process.env.NODE_ENV": '"production"',
    },
    entryPoints: [entry],
    // The app supplies React; bundling it would measure React, not this package.
    external: ["react", "react-dom"],
    format: "esm",
    logLevel: "silent",
    metafile: true,
    minify: true,
    platform: "browser",
    // The same `.web.*`-first order `examples/next-web` configures. Several
    // React Native packages ship their browser build only under that suffix.
    resolveExtensions: [
      ".web.tsx",
      ".web.ts",
      ".web.jsx",
      ".web.js",
      ".web.mjs",
      ".web.cjs",
      ".tsx",
      ".ts",
      ".jsx",
      ".js",
      ".mjs",
      ".cjs",
      ".json",
    ],
    target: ["es2020"],
    write: false,
  });

  const [output] = result.outputFiles;

  if (!output) {
    throw new Error("esbuild produced no output for the browser entry.");
  }

  return {
    gzip: gzipSync(output.contents, { level: 9 }).byteLength,
    metafile: result.metafile,
    minified: output.contents.byteLength,
  };
};

/** @param {number} bytes */
export const formatBytes = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

/**
 * Source bytes per npm package, largest first. Only used when run directly.
 *
 * @param {import("esbuild").Metafile} metafile
 */
const summarizeInputs = (metafile) => {
  /** @type {Map<string, number>} */
  const byPackage = new Map();

  for (const [file, { bytes }] of Object.entries(metafile.inputs)) {
    const match = /node_modules\/((?:@[^/]+\/)?[^/]+)\//.exec(file);
    const name = match?.[1] ?? "magic-modal";
    byPackage.set(name, (byPackage.get(name) ?? 0) + bytes);
  }

  return [...byPackage].sort(([, a], [, b]) => b - a);
};

const isRunDirectly =
  process.argv[1] &&
  import.meta.url === new URL(`file://${process.argv[1]}`).href;

if (isRunDirectly) {
  const { gzip, metafile, minified } = await measureWebBundle();

  console.log(`minified: ${formatBytes(minified)} (${minified} bytes)`);
  console.log(`gzipped:  ${formatBytes(gzip)} (${gzip} bytes)`);
  console.log("\nsource bytes per package");

  for (const entry of summarizeInputs(metafile)) {
    console.log(`${formatBytes(entry[1]).padStart(10)}  ${entry[0]}`);
  }
}
