import { readFile } from "node:fs/promises";

import { formatBytes, measureWebBundle } from "./measure-web-bundle.mjs";

const nativeOutputFiles = [
  "dist/index.react-native.runtime.js",
  "dist/index.react-native.runtime.cjs",
];
const browserOutputFiles = ["dist/index.runtime.js", "dist/index.runtime.cjs"];
const privateScreensImport = "react-native-screens/src/";

/**
 * Every native-only package the browser entry has to stay clear of.
 *
 * The three animation and gesture packages are the expensive ones: together
 * they were 62% of what a web app downloaded for this library before the
 * browser chrome grew its own Web Animations API and Pointer Events
 * implementation. Screens has been out since the portal split.
 */
const nativeOnlyPackages = [
  "react-native-gesture-handler",
  "react-native-reanimated",
  "react-native-screens",
  "react-native-worklets",
];

/**
 * The gzipped ceiling for what a web app downloads, measured the way
 * `measure-web-bundle.mjs` measures it. Set roughly 20% above the real number,
 * so ordinary changes pass and anything that drags a native package back in
 * fails loudly. Re-run `node tools/measure-web-bundle.mjs` and move it
 * deliberately.
 */
const gzipBudgetInBytes = 40_000;
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

/**
 * bunchee keeps source comments, and several of them quote import statements in
 * examples. Dropping comments before the search is what separates "the browser
 * bundle imports gesture-handler" from "a doc comment shows how to mount the
 * root view".
 *
 * @param {string} source
 */
const stripComments = (source) =>
  source.replaceAll(/\/\*[\S\s]*?\*\//g, "").replaceAll(/^\s*\/\/.*$/gm, "");

for (const { output, outputFile } of browserOutputs) {
  const code = stripComments(output);

  for (const packageName of nativeOnlyPackages) {
    // Matches the import and require forms bunchee emits, plus deep imports of
    // each.
    const reference = new RegExp(
      String.raw`(?:from\s*|require\s*\(\s*)(['"])${packageName}(?:/[^'"]*)?\1`,
    );

    if (reference.test(code)) {
      throw new Error(
        `${outputFile} imports ${packageName}, which is native-only. The browser chrome in src/components/magic-modal.browser.tsx exists so the web entry never needs it.`,
      );
    }
  }
}

// The regexes above only see what survived into the emitted file. Resolving the
// browser entry the way a web bundler does catches the rest: a package pulled in
// through a re-export, a `.web.js` variant, or anything else that arrives
// without its name appearing in the output.
const { gzip, metafile, minified } = await measureWebBundle();
const resolvedInputs = Object.keys(metafile.inputs);

for (const packageName of nativeOnlyPackages) {
  const pulledIn = resolvedInputs.find((input) =>
    input.includes(`node_modules/${packageName}/`),
  );

  if (pulledIn) {
    throw new Error(
      `Bundling the browser entry pulls in ${packageName} (${pulledIn}), which is native-only.`,
    );
  }
}

if (gzip > gzipBudgetInBytes) {
  throw new Error(
    `The browser entry gzips to ${formatBytes(gzip)}, over the ${formatBytes(gzipBudgetInBytes)} budget. Run \`node tools/measure-web-bundle.mjs\` to see what grew.`,
  );
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
  `✓ Web package boundary: runtime guard loads first, browser omits ${nativeOnlyPackages.join(", ")}`,
);
console.log(
  `✓ Web bundle: ${formatBytes(minified)} minified, ${formatBytes(gzip)} gzipped (budget ${formatBytes(gzipBudgetInBytes)})`,
);
