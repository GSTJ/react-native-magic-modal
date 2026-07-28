import type { NextConfig } from "next";

import { createMDX } from "fumadocs-mdx/next";
import { createMagicDocsStaticExport } from "magic-docs";

import { site } from "./lib/site";

const config = {
  ...createMagicDocsStaticExport(site),
  reactStrictMode: true,
} satisfies NextConfig;

export default createMDX()(config);
