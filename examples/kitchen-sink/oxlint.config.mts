import expo from "magic-oxlint-config/expo";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [expo],
  // `extends` drops `ignorePatterns` — see packages/modal/oxlint.config.mts.
  ignorePatterns: expo.ignorePatterns,
});
