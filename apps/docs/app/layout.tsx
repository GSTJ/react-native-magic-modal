import type { Metadata } from "next";

import { createMagicDocsMetadata } from "magic-docs";

import { ProjectMetadataBoundary } from "@/components/project-metadata-boundary";
import { Provider } from "@/components/provider";
import { publicPaths, site } from "@/lib/site";

import "./global.css";

const presetMetadata = createMagicDocsMetadata(site);
const socialImage = publicPaths.url("/og.svg");

export const metadata: Metadata = {
  ...presetMetadata,
  openGraph: {
    ...presetMetadata.openGraph,
    images: [{ alt: site.name, height: 630, url: socialImage, width: 1200 }],
  },
  twitter: {
    ...presetMetadata.twitter,
    images: [socialImage],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Provider>
          <ProjectMetadataBoundary>{children}</ProjectMetadataBoundary>
        </Provider>
      </body>
    </html>
  );
}
