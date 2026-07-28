import type { Metadata } from "next";

import "@fontsource-variable/instrument-sans";
import "@fontsource-variable/jetbrains-mono";

import "@fontsource/instrument-serif/400-italic.css";
import "./home.css";

export const metadata: Metadata = {
  title: "Magic Modal — React Native modals you can await",
  description:
    "One root portal, independent stack entries, and typed results for React Native modal flows.",
};

export default function Layout({ children }: LayoutProps<"/">) {
  return children;
}
