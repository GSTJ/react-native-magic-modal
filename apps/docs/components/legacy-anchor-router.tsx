"use client";

import { useEffect } from "react";

import { withBasePath } from "@/lib/site";

const legacyAnchors: Record<string, string> = {
  "#documentation": "/docs/",
  "#examples": "/docs/guides/modal-flows/",
  "#faq": "/docs/faq/",
  "#installation": "/docs/getting-started/installation/",
  "#quickstart": "/docs/getting-started/first-modal/",
  "#usage": "/docs/getting-started/first-modal/",
};

export const LegacyAnchorRouter = () => {
  useEffect(() => {
    const destination = legacyAnchors[window.location.hash.toLowerCase()];

    if (destination) {
      window.location.replace(
        `${withBasePath(destination)}${window.location.search}`,
      );
    }
  }, []);

  return null;
};
