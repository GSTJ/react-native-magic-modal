import type { MDXComponents } from "mdx/types";

import { createMagicDocsMdxComponents } from "magic-docs/mdx";

export const getMDXComponents = (components?: MDXComponents) =>
  createMagicDocsMdxComponents(components);

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
