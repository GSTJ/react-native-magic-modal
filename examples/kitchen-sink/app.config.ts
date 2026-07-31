import type { ExpoConfig } from "expo/config";

export default {
  name: "magic-modal-example",
  slug: "magic-modal-example",
  scheme: "magic-modal",
  description: "Example app for magic-modal",
  version: "1.0.0",
  web: {
    output: "static",
    bundler: "metro",
  },
  plugins: [
    [
      "expo-router",
      {
        origin: "https://kitchen-sink.expo.dev",
      },
    ],
    "./plugins/with-expo-modules-core-swift-strict-concurrency",
  ],
  platforms: ["ios", "android", "web"],
  splash: {
    image: "./assets/blank.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  icon: "./assets/blank.png",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.gstj.reactnativemagicmodalexample",
  },
  android: {
    package: "com.gstj.reactnativemagicmodalexample",
  },
  assetBundlePatterns: ["**/*"],
} satisfies ExpoConfig;
