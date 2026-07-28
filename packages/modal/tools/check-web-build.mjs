import { readFile } from "node:fs/promises";

const outputFiles = ["dist/index.runtime.js", "dist/index.runtime.cjs"];
const privateScreensImport = "react-native-screens/src/";
const entrypoints = [
  {
    entrypoint: "dist/index.js",
    runtimeGuard: 'import "./dev-runtime.js";',
    implementation: 'export * from "./index.runtime.js";',
  },
  {
    entrypoint: "dist/index.cjs",
    runtimeGuard: 'require("./dev-runtime.cjs");',
    implementation: 'module.exports = require("./index.runtime.cjs");',
  },
];

const outputs = await Promise.all(
  outputFiles.map(async (outputFile) => ({
    output: await readFile(new URL(`../${outputFile}`, import.meta.url), {
      encoding: "utf8",
    }),
    outputFile,
  })),
);

for (const { output, outputFile } of outputs) {
  if (output.includes(privateScreensImport)) {
    throw new Error(
      `${outputFile} reaches into a private react-native-screens module.`,
    );
  }
}

const entrypointOutputs = await Promise.all(
  entrypoints.map(async (entrypoint) => ({
    ...entrypoint,
    output: await readFile(
      new URL(`../${entrypoint.entrypoint}`, import.meta.url),
      {
        encoding: "utf8",
      },
    ),
  })),
);

for (const {
  entrypoint,
  implementation,
  output,
  runtimeGuard,
} of entrypointOutputs) {
  const guardPosition = output.indexOf(runtimeGuard);
  const implementationPosition = output.indexOf(implementation);

  if (guardPosition === -1 || implementationPosition === -1) {
    throw new Error(`${entrypoint} is missing its web runtime boundary.`);
  }

  if (guardPosition > implementationPosition) {
    throw new Error(`${entrypoint} loads its implementation before __DEV__.`);
  }
}

console.log(
  "✓ Web package boundary: runtime guard loads first and screens stays public",
);
