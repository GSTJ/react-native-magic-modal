import reactNative from "magic-oxlint-config/react-native";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [reactNative],
  // `extends` drops `ignorePatterns` — only the patterns declared at the top
  // level of the config oxlint loaded are applied, so the preset's have to be
  // re-declared here. Verified with `oxlint --print-config` on 1.75.0: without
  // this line the effective `ignorePatterns` is `[]`.
  ignorePatterns: reactNative.ignorePatterns,
});
