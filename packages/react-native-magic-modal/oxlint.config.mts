import { extendConfig } from "magic-oxlint-config";
import reactNative from "magic-oxlint-config/react-native";

// Same preset as packages/modal. `extendConfig` flattens rather than using
// oxlint's `extends`, which drops `ignorePatterns` — see packages/modal for the
// long version.
export default extendConfig(reactNative, {
  overrides: [
    {
      // tools/ is the release plumbing. Its output is what a human reads when
      // a publish goes sideways.
      files: ["tools/**"],
      rules: { "no-console": "off" },
    },
  ],
});
