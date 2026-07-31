# Next.js web consumer

This fixture imports Magic Modal through its published exports. It covers the App Router server
build, client hydration, opening a modal, and resolving a backdrop dismissal.

Run it from the repository root:

```bash
pnpm --filter magic-modal build
pnpm --filter @magic-modal/next-web build
pnpm --filter @magic-modal/next-web typecheck
pnpm --filter @magic-modal/next-web smoke:browser
```

The smoke check starts the production build in headless Chrome. It clicks the open button and the
backdrop and expects `BACKDROP_PRESS`.

The dependency list in `package.json` is the complete Next.js browser runtime: `magic-modal`,
`next`, `react`, and `react-dom`. No `react-native`, no `react-native-web`, and no gesture or
animation package, because the browser entry renders DOM elements and imports nothing but `react`.
`next.config.ts` is bare for the same reason.

The portal lives in a Client Component. The fixture mounts it directly, with no gesture root view.
