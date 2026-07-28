import type { MetadataRoute } from "next";

import { publicPaths, site } from "@/lib/site";
import { source } from "@/lib/source";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      changeFrequency: "weekly",
      priority: 1,
      url: site.siteUrl,
    },
    ...source.getPages().map((page) => ({
      changeFrequency: "monthly" as const,
      priority: page.slugs.length === 0 ? 0.9 : 0.7,
      url: publicPaths.url(page.url),
    })),
  ];
}
