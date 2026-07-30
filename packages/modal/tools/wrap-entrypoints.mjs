import { rename, writeFile } from "node:fs/promises";

const distDirectory = new URL("../dist/", import.meta.url);
const entrypoints = [
  {
    format: "esm",
    publicName: "index.js",
    runtimeName: "index.runtime.js",
  },
  {
    format: "cjs",
    publicName: "index.cjs",
    runtimeName: "index.runtime.cjs",
  },
  {
    format: "esm",
    publicName: "index.react-native.js",
    runtimeName: "index.react-native.runtime.js",
  },
  {
    format: "cjs",
    publicName: "index.react-native.cjs",
    runtimeName: "index.react-native.runtime.cjs",
  },
];

const runtimeGuard = `const runtime = globalThis;

if (typeof runtime.__DEV__ !== "boolean") {
  runtime.__DEV__ =
    typeof process !== "undefined"
      ? process.env.NODE_ENV !== "production"
      : false;
}
`;

await Promise.all(
  entrypoints.map(({ publicName, runtimeName }) =>
    rename(
      new URL(publicName, distDirectory),
      new URL(runtimeName, distDirectory),
    ),
  ),
);

await Promise.all([
  writeFile(new URL("dev-runtime.js", distDirectory), runtimeGuard),
  writeFile(new URL("dev-runtime.cjs", distDirectory), runtimeGuard),
  ...entrypoints.map(({ format, publicName, runtimeName }) =>
    writeFile(
      new URL(publicName, distDirectory),
      format === "esm"
        ? `import "./dev-runtime.js";

export * from "./${runtimeName}";
`
        : `require("./dev-runtime.cjs");

module.exports = require("./${runtimeName}");
`,
    ),
  ),
]);
