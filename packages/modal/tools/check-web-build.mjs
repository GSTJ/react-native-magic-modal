import { readFile } from "node:fs/promises";

const nativeOutputFiles = [
  "dist/index.react-native.runtime.js",
  "dist/index.react-native.runtime.cjs",
];
const browserOutputFiles = ["dist/index.runtime.js", "dist/index.runtime.cjs"];
const privateScreensImport = "react-native-screens/src/";
const packageJSON = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), {
    encoding: "utf8",
  }),
);
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
  {
    entrypoint: "dist/index.react-native.js",
    runtimeGuard: 'import "./dev-runtime.js";',
    implementation: 'export * from "./index.react-native.runtime.js";',
  },
  {
    entrypoint: "dist/index.react-native.cjs",
    runtimeGuard: 'require("./dev-runtime.cjs");',
    implementation:
      'module.exports = require("./index.react-native.runtime.cjs");',
  },
];

const outputs = await Promise.all(
  nativeOutputFiles.map(async (outputFile) => ({
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

if (!outputs.every(({ output }) => output.includes("react-native-screens"))) {
  throw new Error("The React Native entry lost its iOS FullWindowOverlay.");
}

const browserOutputs = await Promise.all(
  browserOutputFiles.map(async (outputFile) => ({
    output: await readFile(new URL(`../${outputFile}`, import.meta.url), {
      encoding: "utf8",
    }),
    outputFile,
  })),
);

for (const { output, outputFile } of browserOutputs) {
  if (
    output.includes("from 'react-native-screens'") ||
    output.includes('require("react-native-screens")') ||
    output.includes("require('react-native-screens')")
  ) {
    throw new Error(`${outputFile} includes the native-only screens package.`);
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

const packageExport = packageJSON.exports["."];
if (
  packageExport.import.default !== "./dist/index.js" ||
  packageExport.require.default !== "./dist/index.cjs" ||
  packageExport["react-native"].import.default !==
    "./dist/index.react-native.js" ||
  packageExport["react-native"].require.default !==
    "./dist/index.react-native.cjs"
) {
  throw new Error(
    "Package exports no longer separate the SSR-safe default and React Native runtimes.",
  );
}

if (!packageJSON.peerDependenciesMeta["react-native-screens"].optional) {
  throw new Error(
    "react-native-screens must stay optional for browser-only consumers.",
  );
}

console.log(
  "✓ Web package boundary: runtime guard loads first and browser omits screens",
);
