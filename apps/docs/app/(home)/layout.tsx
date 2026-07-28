import type { Metadata } from "next";

import "@fontsource-variable/instrument-sans";
import "@fontsource-variable/jetbrains-mono";

import "@fontsource/instrument-serif/400-italic.css";
import "./home.css";

export const metadata: Metadata = {
  title: {
    absolute: "Awaitable React Native modals with Magic Modal",
  },
  description:
    "Open a React Native modal from any async flow, await its typed result, and keep concurrent prompts in one ordered stack.",
};

export default function Layout({ children }: LayoutProps<"/">) {
  return children;
}
