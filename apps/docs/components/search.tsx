"use client";

import { create } from "@orama/orama";
import { useDocsSearch } from "fumadocs-core/search/client";
import { oramaStaticClient } from "fumadocs-core/search/client/orama-static";
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from "fumadocs-ui/components/dialog/search";
import { useI18n } from "fumadocs-ui/contexts/i18n";

import { publicPaths } from "@/lib/site";

const initOrama = () =>
  create({
    language: "english",
    schema: { _: "string" },
  });

const MagicSearchDialog = (props: SharedProps) => {
  const { locale } = useI18n();
  const { query, search, setSearch } = useDocsSearch({
    client: oramaStaticClient({
      from: publicPaths.searchApi,
      initOrama,
      locale,
    }),
  });
  const items = query.data === "empty" ? null : query.data;

  return (
    <SearchDialog
      isLoading={query.isLoading}
      onSearchChange={setSearch}
      search={search}
      {...props}
    >
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput placeholder="Search guides and API…" />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList items={items} />
      </SearchDialogContent>
    </SearchDialog>
  );
};

export default MagicSearchDialog;
