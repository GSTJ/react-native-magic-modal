import type { Metadata } from "next";

import { notFound } from "next/navigation";

import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from "fumadocs-ui/layouts/docs/page";
import { createRelativeLink } from "fumadocs-ui/mdx";

import { getMDXComponents } from "@/components/mdx";
import { publicPaths, site } from "@/lib/site";
import { getPageMarkdownUrl, source } from "@/lib/source";

const tableOfContent = { style: "clerk" as const };

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const Content = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;
  const components = getMDXComponents({
    a: createRelativeLink(source, page),
  });

  return (
    <DocsPage tableOfContent={tableOfContent} toc={page.data.toc}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <div className="page-actions">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover
          githubUrl={`https://github.com/GSTJ/react-native-magic-modal/blob/main/apps/docs/content/docs/${page.path}`}
          markdownUrl={markdownUrl}
        />
      </div>
      <DocsBody>
        <Content components={components} />
      </DocsBody>
    </DocsPage>
  );
}

export const generateStaticParams = () => source.generateParams();

export async function generateMetadata(
  props: PageProps<"/docs/[[...slug]]">,
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const canonicalUrl = publicPaths.url(page.url);
  const socialImage = publicPaths.url("/og.svg");

  return {
    alternates: {
      canonical: canonicalUrl,
    },
    description: page.data.description,
    openGraph: {
      description: page.data.description,
      images: [{ alt: site.name, height: 630, url: socialImage, width: 1200 }],
      siteName: site.name,
      title: page.data.title,
      type: "article",
      url: canonicalUrl,
    },
    title: page.data.title,
    twitter: {
      card: "summary_large_image",
      description: page.data.description,
      images: [socialImage],
      title: page.data.title,
    },
  };
}
