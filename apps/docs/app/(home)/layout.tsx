import type { Metadata } from "next";

import "@fontsource-variable/instrument-sans";
import "@fontsource-variable/jetbrains-mono";

import "@fontsource/instrument-serif/400-italic.css";
import { publicPaths, site } from "@/lib/site";

import "./home.css";

const title = "Modals you can await | Magic Modal";
const description =
  "Open a modal from any async flow, await its typed result, and keep concurrent prompts in one ordered stack across web, iOS, and Android.";
const socialImage = publicPaths.url("/og.svg");

export const metadata: Metadata = {
  title: {
    absolute: title,
  },
  description,
  openGraph: {
    description,
    images: [{ alt: site.name, height: 630, url: socialImage, width: 1200 }],
    siteName: site.name,
    title,
    type: "website",
    url: site.siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    description,
    images: [socialImage],
    title,
  },
};

export default function Layout({ children }: LayoutProps<"/">) {
  return children;
}
