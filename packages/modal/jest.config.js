export default {
  preset: "jest-expo",
  // Worklets 0.7 exposes a mock, while its web resolver starts at 0.8.
  moduleNameMapper: {
    "^react-native-worklets$": "react-native-worklets/lib/module/mock",
  },
  testResultsProcessor: "jest-junit",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|react-native-gesture-handler|react-native-reanimated|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
  ],
  coverageReporters: ["json-summary", ["text", { file: "coverage.txt" }]],
  setupFiles: ["react-native-gesture-handler/jestSetup.js"],
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
