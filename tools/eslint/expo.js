/** @type {import("eslint").Linter.Config} */
const config = {
  extends: ["./react.js"],
  rules: {
    "reanimated/js-function-in-worklet": 2,
    "react-native/no-inline-styles": 1, // TODO: Enforce this rule later
    "react-native/no-color-literals": 2,
    "react-native/no-single-element-style-arrays": 2,
  },
  plugins: ["react-native", "reanimated"],
};

module.exports = config;
