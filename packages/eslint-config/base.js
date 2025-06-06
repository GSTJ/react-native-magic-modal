/// <reference types="./types.d.ts" />

import eslint from "@eslint/js";
import shopify from "@shopify/eslint-plugin";
import typescript from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";
import eslintComments from "eslint-plugin-eslint-comments";
import importPlugin from "eslint-plugin-import";
import jest from "eslint-plugin-jest";
import jestFormatting from "eslint-plugin-jest-formatting";
import preferArrowFunctions from "eslint-plugin-prefer-arrow-functions";
import testingLibrary from "eslint-plugin-testing-library";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

const restrictedSyntax = [
  "ForInStatement",
  "LabeledStatement",
  "WithStatement",
];

const restrictedEnvAccess = {
  selector: "MemberExpression[object.name='process'][property.name='env']",
  message:
    "Direct process.env usage is not allowed. Import from a dedicated env file instead.",
};

const baseConfig = tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  jest.configs["flat/recommended"],
  {
    files: ["**/*.test.{js,jsx,ts,tsx}"],
    ...testingLibrary.configs["flat/react"],
  },
  {
    files: jestFormatting.configs.recommended.overrides[0].files,
    rules: jestFormatting.configs.recommended.overrides[0].rules,
    plugins: {
      "jest-formatting": jestFormatting,
    },
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@typescript-eslint": typescript,
      "unused-imports": unusedImports,
      import: importPlugin,
      "prefer-arrow-functions": preferArrowFunctions,
      "eslint-comments": eslintComments,
      "@shopify": shopify,
      "testing-library": testingLibrary,
    },
    languageOptions: {
      parser,
      parserOptions: {
        project: true,
      },
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      "@shopify/prefer-early-return": ["error", { maximumStatements: 0 }],
      "@shopify/no-namespace-imports": [
        "error",
        {
          allow: ["@radix-ui", "react"],
        },
      ],
      "@shopify/no-ancestor-directory-import": ["error"],
      "@shopify/restrict-full-import": ["error"],
      // Turn on
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unnecessary-type-parameters": "off", // Consistently misfires
      "@typescript-eslint/no-empty-function": "off", // Empty functions are fine sometimes
      "no-arbitrary-value": "off",
      "no-nested-ternary": "error",
      "max-depth": ["error", 3],
      complexity: ["error", { max: 20 }],
      "no-else-return": ["error", { allowElseIf: false }],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
      "@typescript-eslint/return-await": "error",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/unbound-method": "off",
      "jsx-a11y/no-autofocus": "off",
      "no-restricted-syntax": [
        "error",
        ...restrictedSyntax,
        restrictedEnvAccess,
      ],
      "no-console": "error",
      "no-void": 0,
      "import/no-duplicates": "error",
      "import/no-anonymous-default-export": "off",
      "import/no-cycle": "error",
      "import/order": "off",
      "import/no-mutable-exports": "off",
      "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
      "line-comment-position": "off",
      "unused-imports/no-unused-imports": "error",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/consistent-type-definitions": "error",
      "prefer-arrow-functions/prefer-arrow-functions": [
        "error",
        {
          classPropertiesAllowed: false,
          disallowPrototype: false,
          returnStyle: "unchanged",
          singleReturnOnly: false,
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],
    },
  },
  {
    files: ["**/*.test.{js,jsx,ts,tsx}"],
    plugins: {
      jest,
      "testing-library": testingLibrary,
    },
    rules: {
      "no-restricted-properties": [
        "error",
        {
          object: "jest",
          property: "clearAllMocks",
          message:
            "Please avoid using clearAllMocks directly. Enable automatic clearing in the jest config instead, if it's not already enabled.",
        },
      ],
      "jest/valid-title": [
        "error",
        {
          mustNotMatch: [
            "(^should|^it|correctly|\\.$)",
            "Don't end with a full-stop, and don't start with 'should' or 'it'. Don't use 'correctly', it is presumed.",
          ],
        },
      ],
      "jest/no-disabled-tests": "error",
      "jest/no-focused-tests": "error",
      "jest/no-identical-title": "error",
      "jest/prefer-to-have-length": "error",
      "jest/valid-expect": "error",
      "react-hooks/rules-of-hooks": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "testing-library/render-result-naming-convention": "error",
      "testing-library/no-node-access": "error",
      "testing-library/no-await-sync-queries": "off",
      "testing-library/await-async-queries": "error",
      "testing-library/await-async-utils": "error",
      "testing-library/no-debugging-utils": "error",
      "testing-library/no-manual-cleanup": "error",
      "testing-library/no-unnecessary-act": "error",
      "testing-library/prefer-find-by": "error",
      "testing-library/prefer-presence-queries": "error",
      "testing-library/prefer-screen-queries": "error",
    },
  },
  {
    files: ["**/env.*"],
    rules: {
      "no-restricted-syntax": ["error", ...restrictedSyntax],
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-undef": "off",
    },
  },
  {
    linterOptions: { reportUnusedDisableDirectives: true },
    languageOptions: { parserOptions: { projectService: true } },
  },
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },
);

export default baseConfig;
