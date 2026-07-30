import type { NextConfig } from "next";

const config = {
  reactStrictMode: true,
  transpilePackages: ["react-native-gesture-handler", "react-native-reanimated"],
  turbopack: {
    resolveAlias: {
      "react-native": "react-native-web",
    },
    resolveExtensions: [
      ".web.tsx",
      ".web.ts",
      ".web.jsx",
      ".web.js",
      ".web.mjs",
      ".web.cjs",
      ".tsx",
      ".ts",
      ".jsx",
      ".js",
      ".mjs",
      ".cjs",
      ".json",
    ],
  },
} satisfies NextConfig;

export default config;
