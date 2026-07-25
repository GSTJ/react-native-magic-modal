export default {
  preset: "jest-expo",
  // Worklets ships a resolver that skips its `.native` entrypoints, which
  // otherwise throw "Native part of Worklets doesn't seem to be initialized".
  resolver: "react-native-worklets/jest/resolver.js",
  testResultsProcessor: "jest-junit",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|react-native-gesture-handler|react-native-reanimated|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
  ],
  coverageReporters: ["json-summary", ["text", { file: "coverage.txt" }]],
  setupFiles: ["../../node_modules/react-native-gesture-handler/jestSetup.js"],
  reporters: [
    "default",
    ["github-actions", { silent: false }],
    "summary",
    [
      "jest-junit",
      {
        outputDirectory: "coverage",
        outputName: "jest-junit.xml",
        ancestorSeparator: " › ",
        uniqueOutputName: "false",
        suiteNameTemplate: "{filepath}",
        classNameTemplate: "{classname}",
        titleTemplate: "{title}",
      },
    ],
  ],
  coverageDirectory: "<rootDir>/coverage/",
};
