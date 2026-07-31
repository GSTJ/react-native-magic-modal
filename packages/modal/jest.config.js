const transformIgnorePatterns = [
  "node_modules/(?!((jest-)?react-native|react-native-gesture-handler|react-native-reanimated|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
];

/**
 * The React Native suites: everything not named `*.web.test.*`.
 *
 * jest-expo's default preset resolves `react-native` to React Native proper, so
 * this is where the Reanimated chrome, both gesture-handler surfaces and the
 * portal are exercised.
 */
const nativeProject = {
  displayName: { color: "white", name: "native" },
  preset: "jest-expo",
  // Worklets 0.7 exposes a mock, while its web resolver starts at 0.8.
  moduleNameMapper: {
    "^react-native-worklets$": "react-native-worklets/lib/module/mock",
  },
  setupFiles: ["react-native-gesture-handler/jestSetup.js"],
  testPathIgnorePatterns: ["/node_modules/", String.raw`\.web\.test\.[jt]sx?$`],
  transformIgnorePatterns,
};

/**
 * The browser suites, under jsdom with `react-native` aliased to
 * react-native-web — the same substitution a Next.js or webpack app makes.
 *
 * This is the only environment the browser chrome can render in at all: it is
 * built on DOM APIs, and the React Native test environment has no document.
 * jsdom still has no Web Animations API, so animations land on their final
 * keyframe instead of playing. Timing, and how a drag feels, need a real
 * browser and are covered by `examples/next-web/tools/browser-smoke.mjs`.
 */
const webProject = {
  displayName: { color: "magenta", name: "web" },
  preset: "jest-expo/web",
  testMatch: ["**/*.web.test.[jt]s?(x)"],
  transformIgnorePatterns,
};

export default {
  projects: [nativeProject, webProject],
  testResultsProcessor: "jest-junit",
  coverageReporters: ["json-summary", ["text", { file: "coverage.txt" }]],
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
