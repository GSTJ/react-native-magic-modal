import {
  createMagicDocsPublicPaths,
  defineMagicDocs,
  npmPackageUrl,
} from "magic-docs";

const presetSite = defineMagicDocs({
  name: "Magic Modal",
  description:
    "Open a modal from any async flow, await its typed result, and keep concurrent prompts in one ordered stack across web, iOS, and Android.",
  repository: "https://github.com/GSTJ/magic-modal",
  siteUrl: "https://gstj.github.io/magic-modal",
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
