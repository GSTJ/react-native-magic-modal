import {
  createMagicDocsPublicPaths,
  defineMagicDocs,
  npmPackageUrl,
} from "magic-docs";

const presetSite = defineMagicDocs({
  name: "React Native Magic Modal",
  description:
    "Imperative, type-safe modal flows for React Native. Show a modal from anywhere and await the result.",
  repository: "https://github.com/GSTJ/react-native-magic-modal",
  siteUrl: "https://gstj.github.io/react-native-magic-modal",
  packageName: "react-native-magic-modal",
  docsPath: "/docs",
});
const npm =
  npmPackageUrl(presetSite) ??
  "https://www.npmjs.com/package/react-native-magic-modal";

export const site = {
  ...presetSite,
  shortName: "Magic Modal",
  npm,
  author: "GSTJ",
} as const;

export const publicPaths = createMagicDocsPublicPaths(site);
export const { basePath } = publicPaths;

export const withBasePath = publicPaths.path;
