import { DocsLayout } from "fumadocs-ui/layouts/docs";

import { baseOptions } from "@/lib/layout";
import { source } from "@/lib/source";

const sidebar = { defaultOpenLevel: 1 };

export default function Layout({ children }: LayoutProps<"/docs">) {
  return (
    <DocsLayout
      {...baseOptions()}
      sidebar={sidebar}
      tree={source.getPageTree()}
    >
      {children}
    </DocsLayout>
  );
}
