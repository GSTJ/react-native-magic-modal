"use client";

import type { ReactNode } from "react";

import { RootProvider } from "fumadocs-ui/provider/next";

import SearchDialog from "@/components/search";

const search = { SearchDialog };

export const Provider = ({ children }: { children: ReactNode }) => (
  <RootProvider search={search}>{children}</RootProvider>
);
