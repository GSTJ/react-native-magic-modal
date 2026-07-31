// The shim's whole job is to forward to `magic-modal`. The failure that would
// hurt is bunchee inlining it instead — the tarball would then carry a frozen
// copy of the library, and installing `react-native-magic-modal` would give a
// consumer two copies of the modal stack in one bundle, with two portals and
// two sets of module state.
//
// bunchee externalises anything in `dependencies`, so this holds today. It is
// checked anyway because the symptom in a consumer's app (a modal that resolves
// a promise nobody is awaiting) is a long way from the cause.
import { readFile } from "node:fs/promises";

// `export * from 'magic-modal'` in the ESM builds and declarations,
// `require('magic-modal')` in the CJS ones. bunchee emits single quotes; the
// quote style is not something to depend on.
const FORWARDS_TO_MAGIC_MODAL = /(?:from\s*|require\()\s*["']magic-modal["']/;

const entrypoints = [
  "dist/index.js",
  "dist/index.cjs",
  "dist/index.react-native.js",
  "dist/index.react-native.cjs",
];

const packageJSON = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), {
    encoding: "utf8",
  }),
);

const outputs = await Promise.all(
  entrypoints.map(async (entrypoint) => ({
    entrypoint,
    output: await readFile(new URL(`../${entrypoint}`, import.meta.url), {
      encoding: "utf8",
    }),
  })),
);

for (const { entrypoint, output } of outputs) {
  if (!FORWARDS_TO_MAGIC_MODAL.test(output)) {
    throw new Error(
      `${entrypoint} does not re-export magic-modal. bunchee inlined it instead of leaving it external.`,
    );
  }

  // A forwarding module is a handful of lines. Anything larger means library
  // code got bundled in next to the re-export.
  if (output.split("\n").length > 40) {
    throw new Error(
      `${entrypoint} is larger than a re-export should be. Check that magic-modal stayed external.`,
    );
  }
}

// The declaration files have to forward too, or a consumer on the old name gets
// `any` for the entire API while the runtime keeps working.
const declarations = [
  "dist/index.d.ts",
  "dist/index.d.cts",
  "dist/index.react-native.d.ts",
  "dist/index.react-native.d.cts",
];

await Promise.all(
  declarations.map(async (declaration) => {
    const output = await readFile(
      new URL(`../${declaration}`, import.meta.url),
      { encoding: "utf8" },
    );
    if (!FORWARDS_TO_MAGIC_MODAL.test(output)) {
      throw new Error(`${declaration} does not re-export magic-modal's types.`);
    }
  }),
);

// Same shape as magic-modal's export map, condition for condition. A resolver
// that finds `react-native` on the real package has to find it here too,
// otherwise Metro silently falls back to the web entry and the iOS
// FullWindowOverlay disappears.
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
    "Package exports no longer mirror magic-modal's React Native and default conditions.",
  );
}

if (packageJSON.dependencies["magic-modal"] !== "workspace:*") {
  throw new Error(
    "magic-modal must stay a `workspace:*` dependency. pnpm rewrites it to the exact published version at pack time, which is what makes the two packages lockstep.",
  );
}

console.log("✓ Shim boundary: every entry forwards to magic-modal");
