import { docs } from "collections/server";
import { loader } from "fumadocs-core/source";
import { createMagicDocsLlmPage } from "magic-docs/llms";

import { publicPaths, site } from "./site";

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});

export const getPageMarkdownUrl = (page: (typeof source)["$inferPage"]) => {
  const segments = [...page.slugs, "content.md"];

  return {
    segments,
    url: publicPaths.markdown(page.url),
  };
};

export const getLLMText = async (page: (typeof source)["$inferPage"]) => {
  const processed = await page.data.getText("processed");

  return createMagicDocsLlmPage(site, {
    title: page.data.title,
    description: page.data.description,
    url: page.url,
    processedMarkdown: processed,
  });
};
