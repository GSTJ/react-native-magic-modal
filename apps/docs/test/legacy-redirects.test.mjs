import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  copyMarkdownPages,
  legacyRedirects,
  renderRedirect,
} from "../scripts/write-legacy-redirects.mjs";

test("keeps every public TypeDoc route alive", () => {
  assert.equal(Object.keys(legacyRedirects).length, 11);
  assert.equal(
    legacyRedirects["types/ModalProps.html"],
    "/docs/reference/modal-props/",
  );
  assert.equal(
    legacyRedirects["variables/magicModal.html"],
    "/docs/reference/magic-modal/",
  );
});

test("renders a GitHub Pages-aware redirect without losing the hash", () => {
  const html = renderRedirect("/docs/reference/modal-props/", "/magic-modal", {
    "#swipedirection": "#direction",
  });

  assert.match(html, /magic-modal\/docs\/reference\/modal-props\//);
  assert.match(html, /location\.hash/);
  assert.match(html, /location\.search/);
  assert.match(html, /#direction/);
  assert.match(html, /noindex/);
});

test("publishes clean Markdown beside each documentation page", async () => {
  const outputDirectory = await mkdtemp(join(tmpdir(), "magic-modal-docs-"));

  try {
    const source = join(outputDirectory, "llms.mdx/docs/reference/modal-props");
    await mkdir(source, { recursive: true });
    await writeFile(join(source, "content.md"), "# Modal options\n");

    await copyMarkdownPages(outputDirectory);

    assert.equal(
      await readFile(
        join(outputDirectory, "docs/reference/modal-props.md"),
        "utf8",
      ),
      "# Modal options\n",
    );
  } finally {
    await rm(outputDirectory, { recursive: true });
  }
});
