# Next.js web consumer

This fixture imports Magic Modal through its published exports. It covers the App Router server
build, client hydration, opening a modal, and resolving a backdrop dismissal.

Run it from the repository root:

```bash
pnpm --filter react-native-magic-modal build
pnpm --filter @magic-modal/next-web build
pnpm --filter @magic-modal/next-web typecheck
pnpm --filter @magic-modal/next-web smoke:browser
```

The smoke check starts the production build in headless Chrome. It clicks the open button and the
backdrop and expects `BACKDROP_PRESS`.

The dependency list in `package.json` is the complete Next.js browser runtime.
`react-native-web` provides the browser implementation for React Native primitives. Turbopack
aliases `react-native` to that package and transpiles Gesture Handler and Reanimated so their `.web`
files win resolution.

The portal lives in a Client Component. The fixture mounts it directly because Gesture Handler skips
the root-view check in the browser.
