// The og:image is rendered by apps/demo-video, which owns the brand card and
// the only copy of it. Next only serves what is inside public/, so the file is
// copied in rather than committed twice — public/og.png is gitignored the same
// way public/r/ is.
//
// Rendering it is a manual, local step (`pnpm --filter @magic-modal/demo-video
// render:poster`), so this script never renders. It copies, and it fails loudly
// if there is nothing to copy, because a missing og:image is the kind of thing
// that ships and is noticed by nobody until a link looks wrong somewhere else.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const here = import.meta.dirname;
const source = join(here, "..", "..", "..", "media", "magic-modal-social.png");
const target = join(here, "..", "public", "og.png");

if (!existsSync(source)) {
  console.error(
    `og:image source missing: ${source}\n` +
      "Render it with: pnpm --filter @magic-modal/demo-video render:poster",
  );
  process.exit(1);
}

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
console.log(`og:image copied to ${target}`);
