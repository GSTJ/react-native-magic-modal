import reactNative from "magic-oxlint-config/react-native";
import { defineConfig, type OxlintConfig } from "oxlint";

export default defineConfig({
  // The cast is a types-only gap in magic-oxlint-config@1.0.0: it declares
  // `overrides[].plugins` as `string[]`, while oxlint's `OxlintConfig` wants
  // the literal plugin-name union, so the preset object is not assignable.
  // The runtime values are exactly those literals.
  extends: [reactNative as OxlintConfig],
  // `extends` drops `ignorePatterns` — only the patterns declared at the top
  // level of the config oxlint loaded are applied, so the preset's have to be
  // re-declared here. Verified with `oxlint --print-config` on 1.75.0: without
  // this line the effective `ignorePatterns` is `[]`.
  ignorePatterns: reactNative.ignorePatterns,
});
