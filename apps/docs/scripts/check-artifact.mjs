import { access, readFile, readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";

import {
  deploymentBasePath,
  legacyRedirects,
} from "./write-legacy-redirects.mjs";

const outputDirectory = new URL("../out/", import.meta.url).pathname;
const requiredFiles = [
  ".nojekyll",
  "api/search",
  "docs.md",
  "docs/index.html",
  "docs/reference/modal-props.md",
  "docs/reference/modal-props/index.html",
  "index.html",
  "llms-full.txt",
  "llms.txt",
  "r/magic-modal.json",
  "r/registry.json",
  "robots.txt",
  "sitemap.xml",
  ...Object.keys(legacyRedirects),
];

await Promise.all(
  requiredFiles.map((path) => access(join(outputDirectory, path))),
);

const htmlFiles = [];
const visit = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });

  await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);

      if (entry.isDirectory()) {
        await visit(path);
      } else if (entry.name.endsWith(".html")) {
        htmlFiles.push(path);
      }
    }),
  );
};

await visit(outputDirectory);

const html = await Promise.all(htmlFiles.map((path) => readFile(path, "utf8")));
if (html.some((content) => /(?:href|src)="\/_next\//u.test(content))) {
  throw new Error("Found a Next asset URL without the GitHub Pages base path.");
}

const internalLinks = [];
for (const [index, content] of html.entries()) {
  for (const match of content.matchAll(/<a\b[^>]*\shref="([^"]+)"/gu)) {
    const href = match[1].replaceAll("&amp;", "&");

    if (!/^[a-z][a-z\d+.-]*:/iu.test(href) && !href.startsWith("//")) {
      internalLinks.push({ href, source: htmlFiles[index] });
    }
  }
}

const resolveInternalTarget = async (pathname) => {
  if (
    pathname !== deploymentBasePath &&
    !pathname.startsWith(`${deploymentBasePath}/`)
  ) {
    return undefined;
  }

  const relativePath = decodeURIComponent(
    pathname.slice(deploymentBasePath.length),
  ).replace(/^\/+/u, "");
  const target = join(outputDirectory, relativePath || "index.html");
  const candidates = [target];

  if (relativePath) {
    candidates.push(join(target, "index.html"), `${target}.html`);
  }

  const resolvedCandidates = await Promise.all(
    candidates.map(async (candidate) => {
      try {
        const details = await stat(candidate);

        return details.isFile() ? candidate : undefined;
      } catch {
        return undefined;
      }
    }),
  );

  return resolvedCandidates.find(Boolean);
};

const checkInternalLink = async ({ href, source }) => {
  const sourcePath = relative(outputDirectory, source).replaceAll("\\", "/");
  const sourceUrlPath = sourcePath.endsWith("index.html")
    ? sourcePath.slice(0, -"index.html".length)
    : sourcePath;
  const url = new URL(
    href,
    `https://docs.magic-modal.dev${deploymentBasePath}/${sourceUrlPath}`,
  );
  const target = await resolveInternalTarget(url.pathname);

  if (!target) {
    return `${relative(outputDirectory, source)} → ${href}`;
  }

  if (url.hash && target.endsWith(".html")) {
    const anchor = decodeURIComponent(url.hash.slice(1));
    const targetHtml = await readFile(target, "utf8");

    if (
      !targetHtml.includes(`id="${anchor}"`) &&
      !targetHtml.includes(`name="${anchor}"`)
    ) {
      return `${relative(outputDirectory, source)} → ${href} (missing anchor)`;
    }
  }

  return undefined;
};

const checkedLinks = await Promise.all(internalLinks.map(checkInternalLink));
const brokenLinks = checkedLinks.filter(Boolean);

if (brokenLinks.length > 0) {
  throw new Error(
    `Found broken internal links:\n${[...new Set(brokenLinks)].join("\n")}`,
  );
}

const home = await readFile(join(outputDirectory, "index.html"), "utf8");
if (!home.includes(`${deploymentBasePath}/_next/`)) {
  throw new Error(
    "Home page does not reference base-path-prefixed Next assets.",
  );
}
if (!home.includes('data-home-version="3"')) {
  throw new Error("Home page is missing the origin-story landing marker.");
}

const generatedReference = await readFile(
  join(outputDirectory, "docs/reference/modal-props.md"),
  "utf8",
);
if (
  !generatedReference.includes("animationInTiming") ||
  /ESTree|"type":"Program"/u.test(generatedReference)
) {
  throw new Error(
    "Generated TypeScript reference is missing or contains serialized AST data.",
  );
}

process.stdout.write(
  `✓ Docs artifact: ${requiredFiles.length} required files, ${htmlFiles.length} HTML files, ${internalLinks.length} internal links\n`,
);
