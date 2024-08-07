import { ExpoConfig } from "expo/config";

export default {
  name: "react-native-magic-modal-example",
  displayName: "MagicModal Example",
  slug: "react-native-magic-modal-example",
  scheme: "magic-modal",
  description: "Example app for react-native-magic-modal",
  privacy: "public",
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
  ios: {
    supportsTablet: true,
  },
  assetBundlePatterns: ["**/*"],
} as ExpoConfig;
