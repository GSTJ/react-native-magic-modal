import { rename, writeFile } from "node:fs/promises";

const distDirectory = new URL("../dist/", import.meta.url);

const runtimeGuard = `const runtime = globalThis;

if (typeof runtime.__DEV__ !== "boolean") {
  runtime.__DEV__ =
    typeof process !== "undefined"
      ? process.env.NODE_ENV !== "production"
      : false;
}
`;

await Promise.all([
  rename(
    new URL("index.js", distDirectory),
    new URL("index.runtime.js", distDirectory),
  ),
  rename(
    new URL("index.cjs", distDirectory),
    new URL("index.runtime.cjs", distDirectory),
  ),
]);

await Promise.all([
  writeFile(new URL("dev-runtime.js", distDirectory), runtimeGuard),
  writeFile(new URL("dev-runtime.cjs", distDirectory), runtimeGuard),
  writeFile(
    new URL("index.js", distDirectory),
    `import "./dev-runtime.js";

export * from "./index.runtime.js";
`,
  ),
  writeFile(
    new URL("index.cjs", distDirectory),
    `require("./dev-runtime.cjs");

module.exports = require("./index.runtime.cjs");
`,
  ),
]);
