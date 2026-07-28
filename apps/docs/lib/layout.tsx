import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

import { BookOpenText } from "lucide-react";
import { createMagicDocsLayout } from "magic-docs/fumadocs";

import { MagicMark } from "@/components/magic-mark";
import { ProjectVersion } from "@/components/project-metadata-values";

import { site } from "./site";

export const baseOptions = (): BaseLayoutProps => {
  const options = createMagicDocsLayout(site, {
    homeUrl: "/",
    links: [
      {
        icon: <BookOpenText />,
        text: "Documentation",
        url: "/docs",
      },
    ],
  });

  return {
    ...options,
    nav: {
      ...options.nav,
      title: (
        <span className="magic-brand">
          <MagicMark size={28} />
          <span>Magic Modal</span>
          <span className="magic-version">
            <ProjectVersion fallback="latest" />
          </span>
        </span>
      ),
      url: "/",
    },
  };
};
