/// <reference types="./types.d.ts" />
import reactNative from "eslint-plugin-react-native";
import reanimated from "eslint-plugin-reanimated";

import reactRules from "@magic/eslint-config/react";

/** @type {Awaited<import('typescript-eslint').Config>} */
export default [
  ...reactRules,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "react-native": reactNative,
      reanimated: reanimated,
    },
    rules: {
      "reanimated/js-function-in-worklet": 2,
      "react-native/no-inline-styles": 1,
      "react-native/no-color-literals": 2,
      "react-native/no-single-element-style-arrays": 2,
    },
  },
];
