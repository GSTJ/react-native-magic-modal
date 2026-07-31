// The conventional-changelog release-it plugin, with one extra rule: a
// computed version that npm can never accept is skipped forward.
//
// 11.0.0 is unpublishable on both packages, permanently:
//
//   - `magic-modal@11.0.0` was published by accident and unpublished. npm
//     burns an unpublished version string forever, so a republish is refused.
//   - `react-native-magic-modal@11.0.0` could not even be unpublished (npm
//     refuses on packages with registry dependents), so it still exists,
//     deprecated, above `latest`. Publishing over an existing version is
//     refused too.
//
// Meanwhile every version source this pipeline reads says 10.1.1: the
// `magic-modal-11.0.0` git tag was deleted, main's package.json was synced
// back, and npm `latest` points at 10.1.1. So the next `feat(modal)!` computes
// 10.1.1 + major = 11.0.0, release-it tags it, cuts the GitHub release, and
// `npm publish` is then rejected — the registry untouched, the repo convinced
// it released. Measured, not assumed: on a branch with a synthetic
// `feat(modal)!` commit, `release-it --release-version --ci` printed 11.0.0.
//
// Overriding `getRecommendedVersion` is the one seam that catches every path a
// bump takes to become a version: the changelog header, the tag name, the
// GitHub release and the npm publish all read the remapped value, so they
// cannot disagree. A check bolted onto the release.yml probe instead would be
// a second opinion about the version, and probe/preset disagreement is exactly
// how 11.0.0 shipped in the first place. The bump math itself stays
// upstream's; only the poisoned result is remapped, loudly.
import ConventionalChangelog from "@release-it/conventional-changelog";

// Computed version -> version to release instead. 11.0.0 skips to 12.0.0
// rather than shipping "11.0.1 as the major": semver tooling reads 11.0.1 as
// a patch of an 11 line that never worked, and anyone who installed the
// accident and ranged `^11.0.0` would silently resolve onto a breaking
// release dressed as a patch. A gap in the number line costs nothing.
//
// `react-native-magic-modal@12.0.0` publishes fine too — the shim mirrors
// whatever version tools/release.mjs finds in this package's package.json,
// and 12.0.0 exists on neither package.
//
// tools/burned-version-check.mjs asserts this map and the remap end to end.
/** @type {Readonly<Partial<Record<string, string>>>} */
export const BURNED_VERSIONS = Object.freeze({
  "11.0.0": "12.0.0",
});

export default class SkipBurnedVersions extends ConventionalChangelog {
  /**
   * @param {Parameters<ConventionalChangelog["getRecommendedVersion"]>[0]} options
   * @returns {Promise<string | null>}
   */
  async getRecommendedVersion(options) {
    const version = await super.getRecommendedVersion(options);
    const skipTo =
      typeof version === "string" ? BURNED_VERSIONS[version] : undefined;
    if (skipTo === undefined) return version;
    // release-it publishes its types as a bare `declare module "release-it"`,
    // so the Plugin base class this ultimately extends is typeless and `log`
    // doesn't exist as far as tsc can see. Same double-cast idiom as
    // `.release-it.js` uses for the preset's typing gap.
    const { log } =
      /** @type {{ log: { warn: (message: string) => void } }} */ (
        /** @type {unknown} */ (this)
      );
    log.warn(
      `Computed version ${version} is burned on npm (unpublished on ` +
        `magic-modal, occupied on react-native-magic-modal); ` +
        `releasing ${skipTo} instead. See tools/skip-burned-versions.mjs.`,
    );
    return skipTo;
  }
}
