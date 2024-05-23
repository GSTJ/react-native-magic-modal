/** @type {import("eslint").Linter.Config} */
const config = {
  extends: [
    "./base.js",
    "plugin:testing-library/react",
    "plugin:react/recommended",
  ],
  rules: {
    "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "testing-library/await-async-queries": "error",
    "testing-library/await-async-utils": "error",
    "testing-library/no-debugging-utils": "error",
    "testing-library/no-manual-cleanup": "error",
    "testing-library/no-unnecessary-act": "error",
    "testing-library/prefer-find-by": "error",
    "testing-library/prefer-presence-queries": "error",
    "testing-library/prefer-screen-queries": "error",
    "react-hooks/rules-of-hooks": "error", // Checks rules of Hooks
    "react-hooks/exhaustive-deps": "error", // Checks effect dependencies
    "jsx-a11y/no-autofocus": "off",
    "react/style-prop-object": "off",
    "react/display-name": "off",
    "react/self-closing-comp": "error",
    "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],
    "react/jsx-boolean-value": ["error", "never"],
    "react/jsx-handler-names": ["warn"],
    "react/jsx-key": [
      "error",
      { checkFragmentShorthand: true, warnOnDuplicates: true },
    ],
    "react/jsx-no-leaked-render": ["error"],
    "react/no-children-prop": 1,
    "react/self-closing-comp": ["error", { component: true }],
    "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],
    "react/jsx-boolean-value": ["error", "never"],
    "react/jsx-handler-names": ["warn"],
    "react/jsx-key": [
      "error",
      { checkFragmentShorthand: true, warnOnDuplicates: true },
    ],
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
  },
  plugins: ["react", "react-hooks"],
};

module.exports = config;
