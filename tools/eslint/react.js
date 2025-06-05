/// <reference types="./types.d.ts" />
import shopify from "@shopify/eslint-plugin";
import react from "eslint-plugin-react";
import reactCompiler from "eslint-plugin-react-compiler";
import hooksPlugin from "eslint-plugin-react-hooks";

import baseRules from "./base";

/** @type {Awaited<import('typescript-eslint').Config>} */
export default [
  ...baseRules,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: {
      react: react,
      "react-compiler": reactCompiler,
      "react-hooks": hooksPlugin,
      "@shopify": shopify,
    },
    rules: {
      ...hooksPlugin.configs.recommended.rules,
      "@shopify/jsx-no-hardcoded-content": "error",
      "@shopify/strict-component-boundaries": "error",
      "@shopify/react-require-autocomplete": ["error"],
      "@shopify/react-hooks-strict-return": ["error"],
      "react-compiler/react-compiler": "error",
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/style-prop-object": "off",
      "react/display-name": "off",
      "react/jsx-boolean-value": ["error", "never"],
      "react/jsx-key": [
        "error",
        { checkFragmentShorthand: true, warnOnDuplicates: true },
      ],
      "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],
      "react/jsx-no-leaked-render": ["error"],
      "react/no-children-prop": 1,
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "arrow-function",
          unnamedComponents: "arrow-function",
        },
      ],
      "react/self-closing-comp": ["error", { component: true }],
      "react/jsx-curly-brace-presence": [
        "error",
        { props: "never", children: "never" },
      ],
      "react/no-unstable-nested-components": ["error", { allowAsProps: false }],
    },
    languageOptions: {
      globals: {
        React: "readonly",
      },
    },
  },
];
