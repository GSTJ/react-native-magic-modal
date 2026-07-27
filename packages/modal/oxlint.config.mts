import { extendConfig } from "magic-oxlint-config";
import reactNative from "magic-oxlint-config/react-native";

// `extendConfig` flattens the preset and this object into a single config
// instead of going through oxlint's `extends`, which drops `ignorePatterns`.
// That is still true on oxlint 1.75.0 with magic-oxlint-config 1.1.0 — checked
// with `--print-config`, an `extends`-only config reports `ignorePatterns: []`.
// Flattening leaves nothing to re-declare by hand.
export default extendConfig(reactNative, {
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
