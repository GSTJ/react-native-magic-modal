import expo from "magic-oxlint-config/expo";
import { defineConfig, type OxlintConfig } from "oxlint";

export default defineConfig({
  // See packages/modal/oxlint.config.mts for why the cast and the repeated
  // `ignorePatterns` are here.
  extends: [expo as OxlintConfig],
  ignorePatterns: expo.ignorePatterns,
});
