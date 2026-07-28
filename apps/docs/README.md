# Magic Modal documentation

This is a custom Fumadocs site, statically exported for GitHub Pages. It replaces
the old TypeDoc declaration dump with task-first guides, a curated API reference,
generated option tables, search, copyable Markdown, and LLM indexes.

## Why this stack

- Fumadocs keeps the site open source and code-owned while exposing a modern
  Next/MDX component system.
- The generated `NewConfigProps` table stays synchronized with package source;
  functions and enums remain curated because their lifecycle semantics matter
  more than raw declarations.
- Static Orama search, `llms.txt`, `llms-full.txt`, and per-page `.md` files work
  on GitHub Pages without a runtime service.
- Current source manifests for
  [Better Auth](https://github.com/better-auth/better-auth/blob/main/docs/package.json),
  [Zod](https://github.com/colinhacks/zod/blob/main/packages/docs/package.json),
  and [shadcn/ui](https://github.com/shadcn-ui/ui/blob/main/apps/v4/package.json)
  independently use Fumadocs with Next and MDX. The official showcase also
  lists Prisma, NativeWind, assistant-ui, and Vercel's open-source SDKs.

The reusable foundation lives in
[`magic-docs`](https://github.com/GSTJ/magic/tree/main/packages/docs) and is
consumed from its pinned npm release.

## Commands

```bash
pnpm docs:dev
pnpm docs
pnpm --filter @magic-modal/docs test
pnpm --filter @magic-modal/docs typecheck
```

Local routes include the production base path:

```text
http://localhost:3000/react-native-magic-modal/
```

`pnpm docs` checks the full static artifact after building. The check covers
GitHub Pages asset prefixes, generated Markdown quality, agent-readable output,
and every legacy TypeDoc URL.

## Content rule

Start with a concrete result, then installation, a five-minute flow,
task-oriented guides, API details, and troubleshooting. Generated reference
supplements prose; it never replaces examples or explains product behavior by
itself.
