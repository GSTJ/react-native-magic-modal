import { copyFile, mkdir, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";

export const deploymentBasePath = "/react-native-magic-modal";

export const legacyRedirects = {
  "enums/MagicModalHideReason.html": "/docs/reference/hide-results/",
  "functions/useMagicModal.html": "/docs/reference/use-magic-modal/",
  "hierarchy.html": "/docs/reference/",
  "modules.html": "/docs/reference/",
  "types/Direction.html": "/docs/reference/modal-props/#direction",
  "types/HideReturn.html": "/docs/reference/hide-results/",
  "types/ModalChildren.html": "/docs/reference/magic-modal/",
  "types/ModalProps.html": "/docs/reference/modal-props/",
  "types/NewConfigProps.html": "/docs/reference/modal-props/",
  "variables/MagicModalPortal.html": "/docs/reference/magic-modal-portal/",
  "variables/magicModal.html": "/docs/reference/magic-modal/",
};

const legacyFragments = {
  "enums/MagicModalHideReason.html": {
    "#back_button_press": "#magicmodalhidereason",
    "#backdrop_press": "#magicmodalhidereason",
    "#global_hide_all": "#magicmodalhidereason",
    "#intentional_hide": "#magicmodalhidereason",
    "#swipe_complete": "#magicmodalhidereason",
  },
  "variables/magicModal.html": {
    "#disablefullwindowoverlay": "#disablefullwindowoverlay",
    "#enablefullwindowoverlay": "#enablefullwindowoverlay",
    "#hide": "#hide",
    "#hideall": "#hideall",
    "#show": "#show",
  },
};

const escapeAttribute = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");

export const renderRedirect = (
  destination,
  basePath = "",
  fragmentMap = {},
) => {
  const target = escapeAttribute(`${basePath}${destination}`);
  const script = `{
    const destination = ${JSON.stringify(`${basePath}${destination}`)};
    const fragments = ${JSON.stringify(fragmentMap)};
    const [path, destinationHash = ""] = destination.split("#", 2);
    const mappedHash = fragments[location.hash.toLowerCase()];
    const hash = mappedHash ?? (destinationHash ? \`#\${destinationHash}\` : location.hash);
    location.replace(path + location.search + hash);
  }`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="0; url=${target}">
    <meta name="robots" content="noindex">
    <link rel="canonical" href="${target}">
    <title>Documentation moved</title>
    <script>${script}</script>
  </head>
  <body>
    <p>This documentation moved to <a href="${target}">${target}</a>.</p>
  </body>
</html>
`;
};

export const copyMarkdownPages = async (outputDirectory) => {
  const sourceDirectory = join(outputDirectory, "llms.mdx", "docs");

  const visit = async (directory) => {
    const entries = await readdir(directory, { withFileTypes: true });

    await Promise.all(
      entries.map(async (entry) => {
        const sourcePath = join(directory, entry.name);

        if (entry.isDirectory()) {
          await visit(sourcePath);
          return;
        }

        if (entry.name !== "content.md") return;

        const pagePath = relative(sourceDirectory, directory);
        const destination =
          pagePath === ""
            ? join(outputDirectory, "docs.md")
            : join(outputDirectory, "docs", `${pagePath}.md`);

        await mkdir(dirname(destination), { recursive: true });
        await copyFile(sourcePath, destination);
      }),
    );
  };

  await visit(sourceDirectory);
};

const main = async () => {
  const outputDirectory = new URL("../out/", import.meta.url).pathname;

  await Promise.all(
    Object.entries(legacyRedirects).map(async ([legacyPath, destination]) => {
      const outputPath = join(outputDirectory, legacyPath);
      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(
        outputPath,
        renderRedirect(
          destination,
          deploymentBasePath,
          legacyFragments[legacyPath],
        ),
      );
    }),
  );

  await copyMarkdownPages(outputDirectory);
  await writeFile(join(outputDirectory, ".nojekyll"), "");
};

if (
  process.argv[1] &&
  import.meta.url === new URL(`file://${process.argv[1]}`).href
) {
  await main();
}
