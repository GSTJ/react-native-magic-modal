import { ExpoConfig } from "expo/config";

export default {
  name: "react-native-magic-modal-example",
  slug: "react-native-magic-modal-example",
  scheme: "magic-modal",
  description: "Example app for react-native-magic-modal",
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
  newArchEnabled: true,
  assetBundlePatterns: ["**/*"],
} satisfies ExpoConfig;
