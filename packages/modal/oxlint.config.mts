import reactNative from "magic-oxlint-config/react-native";
import { defineConfig, type OxlintConfig } from "oxlint";

export default defineConfig({
  // The cast is a types-only gap in magic-oxlint-config@1.0.0: it declares
  // `overrides[].plugins` as `string[]`, while oxlint's `OxlintConfig` wants
  // the literal plugin-name union, so the preset object is not assignable to
  // `defineConfig`'s parameter. The runtime values are exactly those literals.
  extends: [reactNative as OxlintConfig],
  // `extends` drops `ignorePatterns` — only the patterns declared at the top
  // level of the config oxlint loaded are applied, so the preset's have to be
  // re-declared here. Verified with `oxlint --print-config` on 1.75.0: without
  // this line the effective `ignorePatterns` is `[]`.
  ignorePatterns: reactNative.ignorePatterns,

  overrides: [
    {
      // release-it only looks for this exact filename, so it misses the
      // preset's `*.config.{js,…}` glob even though it is a config file.
      files: [".release-it.js"],
      rules: {
        // `export default { … }` is the whole file.
        "import/no-anonymous-default-export": "off",
        // `${version}` and `${branchName}` are release-it's own placeholders,
        // interpolated by release-it. Real template literals would be expanded
        // at config load, before there is a version to interpolate.
        "no-template-curly-in-string": "off",
      },
    },
  ],
});
