// Publishes the `react-native-magic-modal` alias, right after release-it has
// published `magic-modal`.
//
// release-it is not used here. It computes a version from conventional commits,
// writes a changelog and cuts a GitHub release, and this package must not do
// any of that: its version is not its own, it has no commits of its own, and a
// second GitHub release per version would be noise. All it needs is the version
// release-it just decided, which is sitting in packages/modal/package.json by
// the time this runs.
//
// The root `release` script chains the two with `&&`, so this only runs on a
// successful publish of the real package.
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";

import { syncManifest } from "./sync-manifest.mjs";

const DEPRECATION_MESSAGE =
  "Renamed to `magic-modal`. This package still works and still tracks every release, since it depends on `magic-modal` and re-exports it, but new code should install `magic-modal` instead. See https://github.com/GSTJ/magic-modal";

/**
 * @param {string} command
 * @param {string[]} args
 */
const run = (command, args) => {
  console.log(`$ ${command} ${args.join(" ")}`);
  execFileSync(command, args, { stdio: "inherit" });
};

const synced = await syncManifest();

// Read after the sync so the log and the commit below agree with what shipped.
const { version } = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), {
    encoding: "utf8",
  }),
);

// `pnpm publish`, not `npm publish`. The dependency on the real package is
// `workspace:*`, and only pnpm rewrites that to a concrete version when it
// packs. Publishing this with npm would ship a tarball whose manifest says
// `"magic-modal": "workspace:*"`, which no consumer can install.
//
// `--no-git-checks` because release-it has just committed and tagged on the
// runner and the branch is whatever the release job checked out; pnpm's default
// insistence on a clean main is a guard for humans, and this is not one.
run("pnpm", ["publish", "--no-git-checks", "--access", "public"]);

// Deprecate after publishing, not before, and re-run it on every release.
//
// `npm deprecate pkg@"*"` resolves the range against the versions that exist at
// the moment it runs and writes a `deprecated` field into each one. It is not a
// standing rule: a version published afterwards is not deprecated, which is why
// this cannot be a one-off command run by hand at v10. Every shim release has
// to re-apply it or the newest version — the one `npm install
// react-native-magic-modal` actually resolves to — would be the only
// undeprecated version on the package, and nobody would ever see the notice.
//
// Deprecation is a warning printed at install time. It does not unpublish, does
// not block installs and does not break existing lockfiles.
run("npm", ["deprecate", `react-native-magic-modal@*`, DEPRECATION_MESSAGE]);

// Get the bump into the release commit's branch so the sync PR carries it to
// main. release-it committed the real package's bump before this script ran, so
// this lands on top of it; .github/workflows/release.yml then pushes HEAD to
// `chore/release-sync-<version>` and opens the PR. Amending release-it's commit
// instead would move it out from under the tag the GitHub release was cut from.
//
// Only in CI. A human running `pnpm release` locally gets the manifest written
// and left in the working tree to look at, not committed behind their back.
//
// The shared config points `process.env` at a validated env module, which is
// the right default for application code and has nothing to offer a release
// script: this reads one boolean that the runner sets and no build step is
// involved.
// eslint-disable-next-line no-restricted-properties
if (process.env.CI && synced.length > 0) {
  run("git", ["add", "package.json"]);
  run("git", [
    "commit",
    "-m",
    `chore(release): sync the react-native-magic-modal alias to v${version}`,
    "-m",
    "Published from the same commit as magic-modal, at the same version. Written by packages/react-native-magic-modal/tools/release.mjs.",
  ]);
}

console.log(`✓ react-native-magic-modal ${version} published and deprecated`);
