import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The platform split, asserted against what actually ships.
 *
 * This replaces a suite that grepped the source files for particular import
 * statements and particular dependency arrays. That version failed on
 * reformatting and passed on anything that reached a native package by another
 * route — a re-export, a `.web.js` variant, a transitive import. The build
 * output is the thing consumers install, so it is the thing worth pinning.
 *
 * `tools/check-web-build.mjs` enforces the same boundary during the build,
 * including a gzip budget. This suite is the same contract stated where a
 * reader looking for the package's guarantees would go looking for it.
 */

const distDirectory = join(process.cwd(), "dist");

const readDist = (file: string) => {
  const path = join(distDirectory, file);

  if (!existsSync(path)) {
    throw new Error(
      `${file} is missing. These assertions read the built package: run \`pnpm build\` first.`,
    );
  }

  return readFileSync(path, "utf8");
};

/**
 * bunchee keeps source comments, several of which quote import statements in
 * usage examples. Without this, a doc comment reads as a dependency.
 */
const stripComments = (source: string) =>
  source.replaceAll(/\/\*[\S\s]*?\*\//g, "").replaceAll(/^\s*\/\/.*$/gm, "");

const importsPackage = (source: string, packageName: string) =>
  new RegExp(
    String.raw`(?:from\s*|require\s*\(\s*)(['"])${packageName}(?:/[^'"]*)?\1`,
  ).test(stripComments(source));

const browserOutputs = ["index.runtime.js", "index.runtime.cjs"];
const nativeOutputs = [
  "index.react-native.runtime.js",
  "index.react-native.runtime.cjs",
];

/**
 * The packages the browser entry exists to avoid. Reanimated, gesture-handler
 * and Worklets were 62% of the web bundle before it grew its own chrome.
 */
const nativeOnlyPackages = [
  "react-native-gesture-handler",
  "react-native-reanimated",
  "react-native-screens",
  "react-native-worklets",
];

describe("built browser entry", () => {
  it.each(browserOutputs)("keeps native-only packages out of %s", (file) => {
    const output = readDist(file);

    for (const packageName of nativeOnlyPackages) {
      expect({
        file,
        imports: importsPackage(output, packageName),
      }).toStrictEqual({
        file,
        imports: false,
      });
    }
  });

  it.each(browserOutputs)("ships the Web Animations chrome in %s", (file) => {
    const output = readDist(file);

    // The browser chrome drives motion by hand rather than through Reanimated's
    // animated components, so neither helper can be in here.
    expect(output).not.toContain("createAnimatedComponent");
    expect(output).not.toContain("useAnimatedStyle");
    // The tree itself is unchanged, which is what keeps the test IDs and the
    // accessibility contract identical across platforms.
    expect(output).toContain("magic-modal-motion-layer");
    expect(output).toContain("magic-modal-animation-layer");
  });

  it("only reaches react-native, which a web bundler aliases", () => {
    const imported = [
      ...stripComments(readDist("index.runtime.js")).matchAll(
        /from\s*['"]([^'".][^'"]*)['"]/g,
      ),
    ].map(([, specifier]) => specifier);

    expect([...new Set(imported)].sort()).toStrictEqual([
      "react",
      "react-native",
    ]);
  });
});

describe("built React Native entry", () => {
  it.each(nativeOutputs)("keeps its native chrome in %s", (file) => {
    const output = readDist(file);

    expect(importsPackage(output, "react-native-reanimated")).toBe(true);
    expect(importsPackage(output, "react-native-gesture-handler")).toBe(true);
    expect(importsPackage(output, "react-native-screens")).toBe(true);
  });

  it.each(nativeOutputs)(
    "imports screens through its public entry in %s",
    (file) => {
      expect(readDist(file)).not.toContain("react-native-screens/src/");
    },
  );
});
