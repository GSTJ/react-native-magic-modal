import { metaSchema, pageSchema } from "fumadocs-core/source/schema";
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { magicDocsLlmMdxOptions } from "magic-docs/llms";
import { createMagicDocsTypeScript } from "magic-docs/typescript";

const typescript = createMagicDocsTypeScript({
  generator: {
    tsconfigPath: "../../packages/modal/tsconfig.json",
  },
});

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema,
    postprocess: {
      includeProcessedMarkdown: magicDocsLlmMdxOptions,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [typescript.remarkPlugin],
  },
});
