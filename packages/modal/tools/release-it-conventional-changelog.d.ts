// @release-it/conventional-changelog ships no types, and release-it's own
// `declare module "release-it"` shorthand means the Plugin base class is
// typeless anyway, so there is nothing upstream to inherit from. This declares
// only what tools/skip-burned-versions.mjs actually touches: the class and
// the one method it overrides, with the argument shape the plugin's
// `getRecommendedVersion` destructures.
declare module "@release-it/conventional-changelog" {
  interface RecommendedVersionOptions {
    increment?: string;
    latestVersion?: string;
    isPreRelease?: boolean;
    preReleaseId?: string;
    preReleaseBase?: string | number;
  }

  export default class ConventionalChangelog {
    getRecommendedVersion(
      options: RecommendedVersionOptions,
    ): Promise<string | null>;
  }
}
