import type { NextConfig } from "next";

import { createMDX } from "fumadocs-mdx/next";
import { createMagicDocsStaticExport } from "magic-docs";

import { site } from "./lib/site";

const config = {
  ...createMagicDocsStaticExport(site),
  reactStrictMode: true,
  transpilePackages: [
    "react-native-magic-modal",
    "react-native-gesture-handler",
    "react-native-reanimated",
    "react-native-screens",
    "react-native-web",
    "react-native-worklets",
  ],
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

export default createMDX()(config);
