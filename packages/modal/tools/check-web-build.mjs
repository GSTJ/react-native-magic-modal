import { readFile } from "node:fs/promises";

import { formatBytes, measureWebBundle } from "./measure-web-bundle.mjs";

const nativeOutputFiles = [
  "dist/index.react-native.runtime.js",
  "dist/index.react-native.runtime.cjs",
];
const browserOutputFiles = ["dist/index.runtime.js", "dist/index.runtime.cjs"];
const privateScreensImport = "react-native-screens/src/";

/**
 * Every React Native package the browser entry has to stay clear of.
 *
 * `react-native` itself is on the list as of v10.1. The browser chrome renders
 * plain DOM elements, so a web app needs neither react-native nor
 * react-native-web installed, and neither one is 84% of its download any more.
 * The animation and gesture packages went in the release before, when the
 * browser chrome grew its own Web Animations API and Pointer Events
 * implementation.
 *
 * `react-native` matching is anchored on the quote that follows it, so
 * `react-native-magic-modal` in a doc example is not a hit.
 */
const nativeOnlyPackages = [
  "react-native",
  "react-native-web",
  "react-native-gesture-handler",
  "react-native-reanimated",
  "react-native-screens",
  "react-native-worklets",
];

/**
 * The gzipped ceiling for what a web app downloads, measured the way
 * `measure-web-bundle.mjs` measures it. Set roughly 25% above the real number,
 * so ordinary changes pass and anything that drags a React Native package back
 * in fails loudly. Re-run `node tools/measure-web-bundle.mjs` and move it
 * deliberately.
 */
const gzipBudgetInBytes = 6_800;
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
        `${outputFile} imports ${packageName}, which is React Native only. The browser chrome in src/components/magic-modal.browser.tsx renders DOM elements so the web entry never needs it.`,
      );
    }
  }
}

// The regexes above only see what survived into the emitted file. Resolving the
// browser entry the way a web bundler does catches the rest: a package pulled in
// through a re-export, a `.web.js` variant, or anything else that arrives
// without its name appearing in the output.
//
// Measured twice. With the `react-native` -> `react-native-web` alias, because
// that is what a react-native-web app configures and the number has to hold
// there. Without it, because a web-only app has neither package installed, and
// a bundle that only stays small because an alias redirected something is not
// actually independent of it.
const { gzip, metafile, minified } = await measureWebBundle();
const withoutAlias = await measureWebBundle({ withReactNativeAlias: false });
const resolvedInputs = [
  ...Object.keys(metafile.inputs),
  ...Object.keys(withoutAlias.metafile.inputs),
];

for (const packageName of nativeOnlyPackages) {
  const pulledIn = resolvedInputs.find((input) =>
    input.includes(`node_modules/${packageName}/`),
  );

  if (pulledIn) {
    throw new Error(
      `Bundling the browser entry pulls in ${packageName} (${pulledIn}), which is React Native only.`,
    );
  }
}

if (gzip !== withoutAlias.gzip) {
  throw new Error(
    `The browser entry is ${formatBytes(gzip)} gzipped with the react-native alias and ${formatBytes(withoutAlias.gzip)} without it. It resolves something through react-native-web, so a web-only app cannot drop the dependency.`,
  );
}

if (gzip > gzipBudgetInBytes) {
  throw new Error(
    `The browser entry gzips to ${formatBytes(gzip)}, over the ${formatBytes(gzipBudgetInBytes)} budget. Run \`node tools/measure-web-bundle.mjs\` to see what grew.`,
  );
}

// Server rendering imports the module before anything has a DOM. A `document`
// or `window` read at module scope is a crash in a Next.js server component,
// and it is the kind of thing that only shows up in someone else's build.
// Resolved through a URL rather than a bare specifier: `dist` is this script's
// own input, so it does not exist when `typecheck` runs and tsc would report
// the literal as an unresolvable module. Turbo runs the two tasks side by side.
const { MagicModalPortal } = await import(
  new URL("../dist/index.js", import.meta.url).href
);
const { createElement } = await import("react");
const { renderToStaticMarkup } = await import("react-dom/server");
const serverMarkup = renderToStaticMarkup(createElement(MagicModalPortal));

if (!serverMarkup.includes('data-testid="magic-modal-portal"')) {
  throw new Error(
    `The browser entry rendered no portal on the server. Got: ${serverMarkup}`,
  );
}

if (!serverMarkup.includes("<style>")) {
  throw new Error(
    "The server-rendered portal carries no stylesheet, so a modal would paint unstyled before hydration.",
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

// Every React Native peer has to stay optional. The browser entry imports none
// of them, so a web-only install should not be warned about them or have npm
// pull them in — with a pinned react, npm resolving react-native as a required
// peer is an outright ERESOLVE. Native consumers are unaffected: the React
// Native entry imports each one statically, so a missing package is a Metro
// bundling error, not a silent degrade.
const nativePeers = Object.keys(packageJSON.peerDependencies).filter(
  (packageName) => nativeOnlyPackages.includes(packageName),
);

for (const packageName of nativePeers) {
  if (!packageJSON.peerDependenciesMeta[packageName]?.optional) {
    throw new Error(
      `${packageName} must stay optional in peerDependenciesMeta for browser-only consumers.`,
    );
  }
}

// The other half of the same rule: react is the one peer the browser entry does
// import, so it stays required.
if (packageJSON.peerDependenciesMeta.react) {
  throw new Error("react is a required peer of the browser entry.");
}

console.log(
  `✓ Web package boundary: runtime guard loads first, browser omits ${nativeOnlyPackages.join(", ")}`,
);
console.log(
  `✓ Web bundle: ${formatBytes(minified)} minified, ${formatBytes(gzip)} gzipped (budget ${formatBytes(gzipBudgetInBytes)}), identical without the react-native alias`,
);
console.log("✓ Web SSR: the portal and its stylesheet render without a DOM");
console.log(
  `✓ Web peers: react is required, ${nativePeers.join(", ")} are optional`,
);
