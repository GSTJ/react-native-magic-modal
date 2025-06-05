/// <reference types="./types.d.ts" />
import next from "@next/eslint-plugin-next";

import reactRules from "./react";

/** @type {Awaited<import('typescript-eslint').Config>} */
export default [
  ...reactRules,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": next,
    },
  },
];
