/** @type {import("eslint").Linter.Config} */
const config = {
  parser: "@typescript-eslint/parser",
  settings: {
    react: {
      version: "detect",
    },
  },
  extends: ["plugin:@typescript-eslint/recommended"],
  rules: {
    "no-restricted-syntax": [
      "error",
      "ForInStatement",
      "LabeledStatement",
      "WithStatement",
    ],
    "no-console": "error",
    "no-void": 0,
    "import/no-duplicates": "error",
    "import/no-anonymous-default-export": "off",
    "import/order": "off",
    "import/no-mutable-exports": "off",
    "line-comment-position": "off",
    "unused-imports/no-unused-imports": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    // '@typescript-eslint/await-thenable': 'error',
    // '@typescript-eslint/no-floating-promises': 'error',
    // '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
    // '@typescript-eslint/return-await': 'error',
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-arrow-functions/prefer-arrow-functions": [
      "error",
      {
        classPropertiesAllowed: false,
        disallowPrototype: false,
        returnStyle: "unchanged",
        singleReturnOnly: false,
      },
    ],
  },
  plugins: [
    "unused-imports",
    "import",
    "prefer-arrow-functions",
    "@typescript-eslint",
    "prettier",
    "eslint-comments",
  ],
  ignorePatterns: [
    "**/dist/**",
    "**/node_modules/**",
    "**/coverage/**",
    "**/.turbo/**",
    "**/eslint/**",
  ],
};

module.exports = config;
