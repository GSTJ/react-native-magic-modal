# Demo video

Remotion source for the two artefacts this repo ships:

| File                           | Composition        | What it is                                       |
| ------------------------------ | ------------------ | ------------------------------------------------ |
| `media/magic-modal-demo.gif`   | `MagicModalDemo`   | 960x540, 12 fps, 15s. The README hero.           |
| `media/magic-modal-social.png` | `MagicModalSocial` | 1280x640. og:image, and GitHub's social preview. |

There is no mp4. Remotion renders video and the GIF recipe below is a second
ffmpeg pass over that encode, so one exists while a render is running — it lands
in the gitignored `out/` and nothing points at it. It was a committed artefact
once; nothing ever linked it.

`MagicModalDemo` is one file, `src/Composition.tsx`. It is a hand-drawn
illustration of the API, not a recording of a running app: the code panel, the
modal sheets and the typed result are all Remotion primitives. When the public
API changes, the text in that file has to change with it, or the video starts
teaching a signature the package no longer has.

`MagicModalSocial` is the brand card at the bottom of the same file. It is not a
crop of the video: 1280x640 is GitHub's spec, the video is 16:9, and at the size
a preview actually renders the code panel is unreadable. It carries the mark, the
name and one sentence, all inside a 96px inset so GitHub can crop it for any
surface without cutting anything that matters.

## Where the colours come from

Both compositions read `COLORS` and `CODE` at the top of `Composition.tsx`, and
every value there is copied from the landing page — `--mm-*` on `.magic-home` in
`apps/docs/app/(home)/home.css`, plus its `.mm-syntax-token-*` rules. The mark is
`public/magic-mark.svg`, a byte copy of `apps/docs/components/magic-mark.tsx`.

None of that is imported, because depending on the docs app would pull next and
fumadocs into this package. It is copied, which means it can drift. If the site
gets restyled, re-copy both.

## Rendering

Render locally before you open a PR that touches the composition. This package
deliberately has no `build`, `lint` or `typecheck` script, so `pnpm build` and
`pnpm typecheck` at the repo root keep the same task graph they had before it
existed, and Remotion never enters Branch Checkup.

```bash
pnpm --filter @magic-modal/demo-video dev            # Remotion Studio on :3000
pnpm --filter @magic-modal/demo-video render:all     # both artefacts into media/
pnpm --filter @magic-modal/demo-video render:gif     # just the GIF
pnpm --filter @magic-modal/demo-video render:poster  # just the social card
```

`render:gif` renders the intermediate mp4 itself, so either target works on its
own. A full `render:all` takes about 27 seconds on an M-series laptop. Remotion
downloads its own headless browser on the first render.

The docs site serves the social card as its og:image, and Next only serves what
is in `public/`, so `apps/docs` copies it in from `media/` during `prebuild` and
`predev`. Re-render the poster and the site picks it up on its next build.

`remotion versions` prints a zod mismatch warning here: the hoisted workspace
carries zod 3 for the docs site, and `@remotion/zod-types` wants zod 4. Nothing
in this composition uses zod schemas, and renders are byte-reproducible with it,
so the warning is noise.

## The GIF recipe

Remotion cannot emit 12 fps from a 30 fps composition — `--every-nth-frame` only
divides by whole numbers — so the GIF is a second pass over the rendered mp4
using ffmpeg's two-pass palette, through the ffmpeg that ships inside Remotion:

```bash
remotion ffmpeg -y -i out/intermediate.mp4 \
  -filter_complex "scale=960:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
  -r 12 -t 15 ../../media/magic-modal-demo.gif
```

The rate drop is `-r 12` rather than an `fps` filter because Remotion's bundled
ffmpeg is built with 53 filters and `fps` is not one of them. Reach for a system
ffmpeg and you can write `fps=12` in the chain instead — same 180 frames picked,
a few kilobytes of difference in the palette.

`-t 15` is the composition length, and it is load-bearing: `-r` alone rounds the
tail up and emits 182 frames over 15.16s. Change `durationInFrames` and this
number has to follow.

It reads the mp4 rather than a PNG sequence on purpose. The same recipe over
lossless frames lands around 1.0 MB instead of 1.5 MB, which is how we know the
GIF that was already committed had been a second pass over an encode — matching
that keeps successive renders in the same size class.

## Publishing

`.github/workflows/demo-video.yml` runs the same `render:all` on every push to
`main` that touches this directory, and overwrites two objects in the
`portfolio-assets` R2 bucket under the `magic-modal/` prefix:

| Key                      | Served as                                                  |
| ------------------------ | ---------------------------------------------------------- |
| `magic-modal/demo.gif`   | `https://assets.gabrieltaveira.dev/magic-modal/demo.gif`   |
| `magic-modal/social.png` | `https://assets.gabrieltaveira.dev/magic-modal/social.png` |

That bucket and its custom domain belong to GSTJ/gabriel-taveira-portfolio. This
repo borrows a key prefix and adds no Cloudflare resources of its own. It needs
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as repository secrets, with
Account > R2 > Edit on the account that owns the bucket.

The job never writes back to the repository, so `media/` does not update itself.
It is the committed copy, and what the README links today. Render locally in the
PR that changes the composition; the workflow is what keeps the served copies in
step afterwards, not a substitute for that.

## GitHub's social preview

`media/magic-modal-social.png` is also what belongs in the repository's own
social preview. That one is a manual upload: as of today GitHub exposes
`openGraphImageUrl` and `usesCustomOpenGraphImage` on the GraphQL `Repository`
type as read-only fields, `UpdateRepositoryInput` has nothing for it, there is no
REST parameter, and `gh repo edit` has no flag. Settings > (Social preview) >
Edit > "Upload an image..." is the only way in.

GitHub asks for at least 640x320, recommends 1280x640, and caps the file at 1 MB.
The card is 1280x640 and about 61 KB.
