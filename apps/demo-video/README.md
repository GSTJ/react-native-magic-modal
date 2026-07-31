# Demo video

Remotion source for the three artefacts the README and the docs site point at:

| File                                | What it is                     |
| ----------------------------------- | ------------------------------ |
| `media/magic-modal-demo.mp4`        | 1600x900, 30 fps, 15s          |
| `media/magic-modal-demo.gif`        | 960x540, 12 fps, README hero   |
| `media/magic-modal-demo-poster.png` | Frame 130, poster and fallback |

The scene is one file, `src/Composition.tsx`. It is a hand-drawn illustration of
the API, not a recording of a running app: the code panel, the modal sheets and
the typed result are all Remotion primitives. When the public API changes, the
text in that file has to change with it, or the video starts teaching a
signature the package no longer has.

## Rendering

Render locally before you open a PR that touches the composition. This package
deliberately has no `build`, `lint` or `typecheck` script, so `pnpm build` and
`pnpm typecheck` at the repo root keep the same task graph they had before it
existed, and Remotion never enters Branch Checkup.

```bash
pnpm --filter @magic-modal/demo-video dev        # Remotion Studio on :3000
pnpm --filter @magic-modal/demo-video render:all # mp4 + gif + poster into media/
```

`render:all` chains the three, and the GIF step reads the mp4, so run them in
order if you run them individually. A full `render:all` takes about 30 seconds on
an M-series laptop. Remotion downloads its own headless browser on the first
render.

`remotion versions` prints a zod mismatch warning here: the hoisted workspace
carries zod 3 for the docs site, and `@remotion/zod-types` wants zod 4. Nothing
in this composition uses zod schemas, and renders are byte-reproducible with it,
so the warning is noise.

## The GIF recipe

Remotion cannot emit 12 fps from a 30 fps composition — `--every-nth-frame` only
divides by whole numbers — so the GIF is a second pass over the rendered mp4
using ffmpeg's two-pass palette, through the ffmpeg that ships inside Remotion:

```bash
remotion ffmpeg -y -i ../../media/magic-modal-demo.mp4 \
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
lossless frames lands around 1.0 MB instead of 1.6 MB, which is how we know the
committed GIF was always a second pass over the encode — matching that keeps
successive renders in the same size class as the one already in the README.

## Publishing

`.github/workflows/demo-video.yml` runs the same `render:all` on every push to
`main` that touches this directory, and overwrites three objects in the
`portfolio-assets` R2 bucket under the `magic-modal/` prefix:

| Key                           | Served as                                                       |
| ----------------------------- | --------------------------------------------------------------- |
| `magic-modal/demo.mp4`        | `https://assets.gabrieltaveira.dev/magic-modal/demo.mp4`        |
| `magic-modal/demo.gif`        | `https://assets.gabrieltaveira.dev/magic-modal/demo.gif`        |
| `magic-modal/demo-poster.png` | `https://assets.gabrieltaveira.dev/magic-modal/demo-poster.png` |

That bucket and its custom domain belong to GSTJ/gabriel-taveira-portfolio. This
repo borrows a key prefix and adds no Cloudflare resources of its own. It needs
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as repository secrets, with
Account > R2 > Edit on the account that owns the bucket.

The job never writes back to the repository, so `media/` does not update itself.
It is the committed fallback and the copy the README links today. Render locally
in the PR that changes the composition; the workflow is what keeps the served
copies in step afterwards, not a substitute for that.
