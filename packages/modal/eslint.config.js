import { join } from "path";
import { includeIgnoreFile } from "@eslint/compat";
import reactNativeConfig from "magic-eslint-config/react-native";

/** @type {import('typescript-eslint').Config} */
export default [
  includeIgnoreFile(join(import.meta.dirname, "../../.gitignore")),
  ...reactNativeConfig,
];
