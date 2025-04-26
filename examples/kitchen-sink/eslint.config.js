import baseConfig from "@magic/eslint-config/base";
import reactConfig from "@magic/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [{ ignores: [] }, ...baseConfig, ...reactConfig];
