export default {
  preset: "jest-expo",
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
