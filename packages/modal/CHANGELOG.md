# 🦄 Magic Modal Changelog 🪄

## [10.0.0](https://github.com/GSTJ/magic-modal/compare/magic-modal-9.2.0...magic-modal-10.0.0) (2026-07-31)

### ⚠ BREAKING CHANGES

* **modal:** this package is now `magic-modal` on npm, renamed from
  `react-native-magic-modal`. The library is universal: since #334 the browser
  bundle carries no Reanimated, gesture-handler or worklets, and the
  `react-native` prefix no longer fits what ships. `react-native-magic-modal`
  keeps shipping at the same version, depending on `magic-modal` and re-exporting
  it, so an existing install resolves to the same code; npm shows a deprecation
  notice on it pointing here. Install `magic-modal` and update the import
  specifier.
  ```

  This is the v10 gate. Merging it computes a `major` bump (verified
  through the repo's own `conventional-recommended-bump` preset) and
  renames the published package, so it merges last, after the in-flight v9
  work.

  The package renames to `magic-modal`. The old name stays alive as a
  lockstep alias: `packages/react-native-magic-modal` depends on
  `magic-modal` at `workspace:*` (pnpm rewrites it to the exact version at
  pack time) and every entry is `export * from "magic-modal"`, mirroring
  the export map condition for condition. `import.meta.resolve` probes
  confirm both the default and `react-native` conditions forward to the
  same files as importing `magic-modal` directly, and a tsc probe confirms
  the types forward (a wrong `Direction` value errors instead of
  collapsing to `any`).

  Release wiring: the root `release` script publishes `magic-modal` via
  release-it, then runs the alias's `tools/release.mjs`, which syncs the
  version, publishes with `pnpm publish` (npm would ship the unrewritten
  `workspace:*`), and runs `npm deprecate` on the old name after every
  publish. The deprecate is per-publish rather than a one-off because npm
  resolves the range when the command runs: a single deprecate at v10
  would leave every later alias version, the one installs actually resolve
  to, without the notice.

### :hammer: Bug Fixes :hammer:

* **docs:** serve the site from magic-modal.gabrieltaveira.dev ([#337](https://github.com/GSTJ/magic-modal/issues/337)) ([2e9790e](https://github.com/GSTJ/magic-modal/commit/2e9790ee5d9b663c8515b43e42aba91db75d577b)), references [#333](https://github.com/GSTJ/magic-modal/issues/333) [#335](https://github.com/GSTJ/magic-modal/issues/335)
* **docs:** update links to the renamed magic-modal repo ([#333](https://github.com/GSTJ/magic-modal/issues/333)) ([e4d1665](https://github.com/GSTJ/magic-modal/commit/e4d1665be279fa91c9fe0c49a6360ab1a520bde6))
* **modal:** mount the iOS overlay only while modals are on screen ([#329](https://github.com/GSTJ/magic-modal/issues/329)) ([8577b56](https://github.com/GSTJ/magic-modal/commit/8577b56b7cddd1178a20440c5e4134705c806c4a)), references [#328](https://github.com/GSTJ/magic-modal/issues/328)

### :stars: New Features :stars:

* **modal:** cut the web bundle by 82% (176.6 -> 32.2 KB gzip) ([#334](https://github.com/GSTJ/magic-modal/issues/334)) ([326b018](https://github.com/GSTJ/magic-modal/commit/326b01857e51ad655d9436892fc83cdaa48b8ea9))

### :dash: Code Improvements :dash:

* **modal:** rename the published package to magic-modal ([#335](https://github.com/GSTJ/magic-modal/issues/335)) ([4141a57](https://github.com/GSTJ/magic-modal/commit/4141a57fc7ca1a89e86eacedd0a7dfcd8b94f58d)), references [#333](https://github.com/GSTJ/magic-modal/issues/333) [#332](https://github.com/GSTJ/magic-modal/issues/332) [#334](https://github.com/GSTJ/magic-modal/issues/334) [#334](https://github.com/GSTJ/magic-modal/issues/334) [#337](https://github.com/GSTJ/magic-modal/issues/337) [#329](https://github.com/GSTJ/magic-modal/issues/329) [#332](https://github.com/GSTJ/magic-modal/issues/332) [#333](https://github.com/GSTJ/magic-modal/issues/333) [#337](https://github.com/GSTJ/magic-modal/issues/337) [#334](https://github.com/GSTJ/magic-modal/issues/334) [#329](https://github.com/GSTJ/magic-modal/issues/329)

### :curly_loop: What a drag! :curly_loop:

* **release:** sync magic modal version with npm 9.2.0 ([#332](https://github.com/GSTJ/magic-modal/issues/332)) ([97178c8](https://github.com/GSTJ/magic-modal/commit/97178c8e009e29b39946d08230ea27ecab23d945))

### :books: Documentation :books:

* README with demo GIF and link updates ([8fffdfd](https://github.com/GSTJ/magic-modal/commit/8fffdfde25769fa5884539c794ecfba957f7da56))

## [9.2.0](https://github.com/GSTJ/react-native-magic-modal/compare/magic-modal-9.1.0...magic-modal-9.2.0) (2026-07-31)

### :hammer: Bug Fixes :hammer:

* **ci:** ship the README in the npm tarball ([#318](https://github.com/GSTJ/react-native-magic-modal/issues/318)) ([c511b69](https://github.com/GSTJ/react-native-magic-modal/commit/c511b6972db3c9d6c9cc4feeff816821beb96f53)), references [react-native-magic-modal#release](https://github.com/react-native-magic-modal/issues/release)
* **docs:** polish interactive demos and responsive frames ([#317](https://github.com/GSTJ/react-native-magic-modal/issues/317)) ([2f95cd4](https://github.com/GSTJ/react-native-magic-modal/commit/2f95cd4a9360d6aeb5c956359a4cff8f7dd2d61c))
* **docs:** stop the footer column clipping between 701px and 812px ([#319](https://github.com/GSTJ/react-native-magic-modal/issues/319)) ([40cfb2f](https://github.com/GSTJ/react-native-magic-modal/commit/40cfb2fab4904c694ee4e18411174d42f26ebe37))

### :stars: New Features :stars:

* **modal:** return an awaitable handle from magicModal.show ([#328](https://github.com/GSTJ/react-native-magic-modal/issues/328)) ([aa1434b](https://github.com/GSTJ/react-native-magic-modal/commit/aa1434ba443bd2830489bd741fce3af277a30c37))

### :curly_loop: What a drag! :curly_loop:

* **deps:** update dependency @types/node to v26.1.2 ([#323](https://github.com/GSTJ/react-native-magic-modal/issues/323)) ([c50e271](https://github.com/GSTJ/react-native-magic-modal/commit/c50e27157da3652bf392e39faea09e2345b59d67))
* **deps:** update dependency postcss to v8.5.24 ([#326](https://github.com/GSTJ/react-native-magic-modal/issues/326)) ([ea1b942](https://github.com/GSTJ/react-native-magic-modal/commit/ea1b9425d3a292fa3eb5c1a8a7480901314ac882))
* **release:** sync magic modal version with npm 9.1.0 ([#316](https://github.com/GSTJ/react-native-magic-modal/issues/316)) ([f7d88ba](https://github.com/GSTJ/react-native-magic-modal/commit/f7d88ba1231ed4708f11b5ce9c93cadd8d2d2d34))

## [9.1.0](https://github.com/GSTJ/react-native-magic-modal/compare/magic-modal-9.0.1...magic-modal-9.1.0) (2026-07-29)

### :hammer: Bug Fixes :hammer:

* **changelog:** render the types that reach the tarball ([#307](https://github.com/GSTJ/react-native-magic-modal/issues/307)) ([f241ff9](https://github.com/GSTJ/react-native-magic-modal/commit/f241ff9ae91a90f4f79dbe1aed601abeee94ccfe)), references [#298](https://github.com/GSTJ/react-native-magic-modal/issues/298) [#300](https://github.com/GSTJ/react-native-magic-modal/issues/300) [#304](https://github.com/GSTJ/react-native-magic-modal/issues/304)
* **ci:** pin the turbo cache action and gate e2e on writable reviewers ([#315](https://github.com/GSTJ/react-native-magic-modal/issues/315)) ([429258d](https://github.com/GSTJ/react-native-magic-modal/commit/429258d9a1e9050e5ee4870fa77fd3d8604f6d62)), references [#309](https://github.com/GSTJ/react-native-magic-modal/issues/309)
* **docs:** override postcss and sharp past next's vulnerable pins ([#309](https://github.com/GSTJ/react-native-magic-modal/issues/309)) ([b0169bf](https://github.com/GSTJ/react-native-magic-modal/commit/b0169bf3580fab8231add273a6030b4e4552fca3)), references [#28](https://github.com/GSTJ/react-native-magic-modal/issues/28) [#30](https://github.com/GSTJ/react-native-magic-modal/issues/30) [#31](https://github.com/GSTJ/react-native-magic-modal/issues/31) [#32](https://github.com/GSTJ/react-native-magic-modal/issues/32) [#314](https://github.com/GSTJ/react-native-magic-modal/issues/314)

### :stars: New Features :stars:

* **modal:** run the portal on the web and rebuild the docs site ([#310](https://github.com/GSTJ/react-native-magic-modal/issues/310)) ([b159af2](https://github.com/GSTJ/react-native-magic-modal/commit/b159af2145843dc1ca7c00944c57ad2f23192eef))

### :curly_loop: What a drag! :curly_loop:

* **deps:** update dependency next to v16.2.12 ([#314](https://github.com/GSTJ/react-native-magic-modal/issues/314)) ([a2280e1](https://github.com/GSTJ/react-native-magic-modal/commit/a2280e1cbe18a82a6f25d6e10de5f0dfec6a4af3))
* **release:** sync magic modal version with npm 9.0.1 ([#304](https://github.com/GSTJ/react-native-magic-modal/issues/304)) ([183d581](https://github.com/GSTJ/react-native-magic-modal/commit/183d58175441891efa37caf8ef4d97629fd3fdcc))
* **renovate:** hold react and the reanimated pair to the Expo SDK line ([#311](https://github.com/GSTJ/react-native-magic-modal/issues/311)) ([d1f3353](https://github.com/GSTJ/react-native-magic-modal/commit/d1f33538262fbd4f9f81cb53b3fa7fee19d11f2b)), references [#305](https://github.com/GSTJ/react-native-magic-modal/issues/305) [#306](https://github.com/GSTJ/react-native-magic-modal/issues/306) [#305](https://github.com/GSTJ/react-native-magic-modal/issues/305) [#306](https://github.com/GSTJ/react-native-magic-modal/issues/306)

### :books: Documentation :books:

* add a security policy ([#308](https://github.com/GSTJ/react-native-magic-modal/issues/308)) ([d9604a0](https://github.com/GSTJ/react-native-magic-modal/commit/d9604a0535ae050298654f8d534302839f8739f5))

## [9.0.1](https://github.com/GSTJ/react-native-magic-modal/compare/magic-modal-9.0.0...magic-modal-9.0.1) (2026-07-28)

### :hammer: Bug Fixes :hammer:

* **ci:** compute the release bump from the magic-modal-* tags ([#261](https://github.com/GSTJ/react-native-magic-modal/issues/261)) ([4e6722d](https://github.com/GSTJ/react-native-magic-modal/commit/4e6722d11961f6acd5cfad227cbb9fd369a6e88d)), references [#241](https://github.com/GSTJ/react-native-magic-modal/issues/241)
* **ci:** put the e2e runner back on macos-15 ([#293](https://github.com/GSTJ/react-native-magic-modal/issues/293)) ([ada0a8a](https://github.com/GSTJ/react-native-magic-modal/commit/ada0a8a9e2bbca38f731361fcf3ad5d372cb80c0)), references [#284](https://github.com/GSTJ/react-native-magic-modal/issues/284)
* **ci:** retry the CI-opened PR when no pull_request run appears ([#269](https://github.com/GSTJ/react-native-magic-modal/issues/269)) ([483e2e1](https://github.com/GSTJ/react-native-magic-modal/commit/483e2e194d0687a2b9b3e2a6e81584e3da14b181)), references [#260](https://github.com/GSTJ/react-native-magic-modal/issues/260) [#256](https://github.com/GSTJ/react-native-magic-modal/issues/256) [#264](https://github.com/GSTJ/react-native-magic-modal/issues/264) [#260](https://github.com/GSTJ/react-native-magic-modal/issues/260) [#251](https://github.com/GSTJ/react-native-magic-modal/issues/251) [#251](https://github.com/GSTJ/react-native-magic-modal/issues/251) [#260](https://github.com/GSTJ/react-native-magic-modal/issues/260)
* **ci:** stop bot-quoted breaking notes from driving the release bump ([#301](https://github.com/GSTJ/react-native-magic-modal/issues/301)) ([8a3dc87](https://github.com/GSTJ/react-native-magic-modal/commit/8a3dc879072c97e08b15ed25ef7e4b037c2ccd06)), references [#295](https://github.com/GSTJ/react-native-magic-modal/issues/295) [#261](https://github.com/GSTJ/react-native-magic-modal/issues/261)
* **ci:** take includeIgnoreFile from @eslint/config-helpers ([#267](https://github.com/GSTJ/react-native-magic-modal/issues/267)) ([0b4bf1b](https://github.com/GSTJ/react-native-magic-modal/commit/0b4bf1bbbfdaecab417029e58985c89bf891f0c1)), closes [#262](https://github.com/GSTJ/react-native-magic-modal/issues/262), references [#262](https://github.com/GSTJ/react-native-magic-modal/issues/262)
* **modal:** launch modern docs and align package metadata ([#303](https://github.com/GSTJ/react-native-magic-modal/issues/303)) ([61ddf85](https://github.com/GSTJ/react-native-magic-modal/commit/61ddf851e119dd31e45b986b05bd98adc80616e0))

### :dash: Code Improvements :dash:

* **ci:** cut the iOS Maestro smoke job ([#292](https://github.com/GSTJ/react-native-magic-modal/issues/292)) ([2d5cae7](https://github.com/GSTJ/react-native-magic-modal/commit/2d5cae76c695b4dfec8b0172799fa02e6e0fb352))
* **ci:** run the iOS e2e on main so PRs start warm ([#299](https://github.com/GSTJ/react-native-magic-modal/issues/299)) ([65712a1](https://github.com/GSTJ/react-native-magic-modal/commit/65712a1c620ff3ebcd83bbfe6a652bcd49e9e19f)), references [#292](https://github.com/GSTJ/react-native-magic-modal/issues/292) [#292](https://github.com/GSTJ/react-native-magic-modal/issues/292)

### :curly_loop: What a drag! :curly_loop:

* **ci:** dry-run the release sync PR path ([#264](https://github.com/GSTJ/react-native-magic-modal/issues/264)) ([137ffcb](https://github.com/GSTJ/react-native-magic-modal/commit/137ffcbb45cd3d345596fe1e93c7e37260bab8db))
* **ci:** dry-run the release sync PR path ([#273](https://github.com/GSTJ/react-native-magic-modal/issues/273)) ([4560e42](https://github.com/GSTJ/react-native-magic-modal/commit/4560e42db00f17fff58694994aedfe4c1dfa8eb1))
* **ci:** give branch-validation and e2e-ios explicit token scopes ([#265](https://github.com/GSTJ/react-native-magic-modal/issues/265)) ([1b2615b](https://github.com/GSTJ/react-native-magic-modal/commit/1b2615ba24439e5a6557bd419a17521302e4bcc9))
* **ci:** hold jest and RNTL to the Expo SDK line ([#291](https://github.com/GSTJ/react-native-magic-modal/issues/291)) ([1806366](https://github.com/GSTJ/react-native-magic-modal/commit/18063666dd79b851d96f048d69422adad72005fc)), references [#280](https://github.com/GSTJ/react-native-magic-modal/issues/280) [#275](https://github.com/GSTJ/react-native-magic-modal/issues/275)
* **ci:** move three more actions to their node 24 majors ([#266](https://github.com/GSTJ/react-native-magic-modal/issues/266)) ([a9661ba](https://github.com/GSTJ/react-native-magic-modal/commit/a9661ba29b8a5cc73568df754581df761c55616a)), references [#251](https://github.com/GSTJ/react-native-magic-modal/issues/251) [#251](https://github.com/GSTJ/react-native-magic-modal/issues/251) [#265](https://github.com/GSTJ/react-native-magic-modal/issues/265) [#253](https://github.com/GSTJ/react-native-magic-modal/issues/253) [#254](https://github.com/GSTJ/react-native-magic-modal/issues/254) [#258](https://github.com/GSTJ/react-native-magic-modal/issues/258)
* **ci:** pin @babel/core and @expo/metro-runtime to the Expo SDK line ([#268](https://github.com/GSTJ/react-native-magic-modal/issues/268)) ([bc54c18](https://github.com/GSTJ/react-native-magic-modal/commit/bc54c18685159e0cd173cfbbea701686ae554cac)), references [#259](https://github.com/GSTJ/react-native-magic-modal/issues/259) [#263](https://github.com/GSTJ/react-native-magic-modal/issues/263)
* **deps:** move react-native to 0.83.10, the SDK 55 line ([#302](https://github.com/GSTJ/react-native-magic-modal/issues/302)) ([46d9b3a](https://github.com/GSTJ/react-native-magic-modal/commit/46d9b3a3194f4c969d0425c9c40ea5ac494be10f))
* **deps:** update dependency @release-it/conventional-changelog to v12 ([#272](https://github.com/GSTJ/react-native-magic-modal/issues/272)) ([87d825d](https://github.com/GSTJ/react-native-magic-modal/commit/87d825d382ddcb58373f008b7381314bce0d53ba)), references [#8203](https://github.com/GSTJ/react-native-magic-modal/issues/8203)
* **deps:** update dependency bunchee to v6.12.2 ([#282](https://github.com/GSTJ/react-native-magic-modal/issues/282)) ([d70df1c](https://github.com/GSTJ/react-native-magic-modal/commit/d70df1c4fc002417e6ed132cf47dfc2bd1bde99e))
* **deps:** update dependency jest-expo to v57 ([#281](https://github.com/GSTJ/react-native-magic-modal/issues/281)) ([8a9bd0b](https://github.com/GSTJ/react-native-magic-modal/commit/8a9bd0b95c40bd32976a1003b1b4b7d3de4dd26b))
* **deps:** update dependency jest-junit to v17 ([#283](https://github.com/GSTJ/react-native-magic-modal/issues/283)) ([8a13e84](https://github.com/GSTJ/react-native-magic-modal/commit/8a13e84b6d5ca2fd92b93a609c92d572c97abcb0))
* **deps:** update dependency macos to v26 ([#284](https://github.com/GSTJ/react-native-magic-modal/issues/284)) ([8cc18ff](https://github.com/GSTJ/react-native-magic-modal/commit/8cc18fff325f24fb55d90457cff41ae36d6eb828))
* **deps:** update dependency node to v24 ([#285](https://github.com/GSTJ/react-native-magic-modal/issues/285)) ([a48080d](https://github.com/GSTJ/react-native-magic-modal/commit/a48080dc7b57ae41b511205986fa7a42fdd6a5bd)), references [#8203](https://github.com/GSTJ/react-native-magic-modal/issues/8203) [#8203](https://github.com/GSTJ/react-native-magic-modal/issues/8203) [#8203](https://github.com/GSTJ/react-native-magic-modal/issues/8203) [#8203](https://github.com/GSTJ/react-native-magic-modal/issues/8203) [#8203](https://github.com/GSTJ/react-native-magic-modal/issues/8203)
* **deps:** update dependency pod-install to v1 ([#286](https://github.com/GSTJ/react-native-magic-modal/issues/286)) ([f20c156](https://github.com/GSTJ/react-native-magic-modal/commit/f20c156644b72e508f4881fb9555018698111783))
* **deps:** update dependency release-it to v21 ([#287](https://github.com/GSTJ/react-native-magic-modal/issues/287)) ([a14682e](https://github.com/GSTJ/react-native-magic-modal/commit/a14682e479b66fab5dc21c1568c8a5ca33475824))
* **deps:** update dependency undici to v8 ([#294](https://github.com/GSTJ/react-native-magic-modal/issues/294)) ([0680b3e](https://github.com/GSTJ/react-native-magic-modal/commit/0680b3eeb641385437a4b7f119feb167e34ad382))
* **deps:** update dependency uuid to v14 ([#295](https://github.com/GSTJ/react-native-magic-modal/issues/295)) ([d6ed5c1](https://github.com/GSTJ/react-native-magic-modal/commit/d6ed5c1ddfe0b813ec05e6bc683fa43e97fddf99)), references [#8203](https://github.com/GSTJ/react-native-magic-modal/issues/8203) [#8203](https://github.com/GSTJ/react-native-magic-modal/issues/8203) [#8203](https://github.com/GSTJ/react-native-magic-modal/issues/8203) [#8203](https://github.com/GSTJ/react-native-magic-modal/issues/8203)
* **deps:** update github actions ([#296](https://github.com/GSTJ/react-native-magic-modal/issues/296)) ([9256a73](https://github.com/GSTJ/react-native-magic-modal/commit/9256a73b3fe4efcda5f9d8f69c3f24780dfadb7b)), references [#8203](https://github.com/GSTJ/react-native-magic-modal/issues/8203)
* migrate to the shared magic tooling stack ([#270](https://github.com/GSTJ/react-native-magic-modal/issues/270)) ([e0d342f](https://github.com/GSTJ/react-native-magic-modal/commit/e0d342fe89f7fe0ec2054104df95676aaf74597c))
* **release:** sync magic modal version with npm 9.0.0 ([#260](https://github.com/GSTJ/react-native-magic-modal/issues/260)) ([0a16e64](https://github.com/GSTJ/react-native-magic-modal/commit/0a16e647de4ace2b23f88bbb7e182f9e7df21931))

## [9.0.0](https://github.com/GSTJ/react-native-magic-modal/compare/magic-modal-8.0.0...magic-modal-9.0.0) (2026-07-27)

Nothing in this release is breaking. It should have been 8.1.0. The recommended
bump was computed over a 53-commit range going back to the 6.x `v*` tags, so it
re-counted the breaking marker on #241 that 8.0.0 already shipped. Fixed in
`.release-it.js`, see #261.

### :hammer: Bug Fixes :hammer:

- **ci:** auto-merge the release sync PR past the required check ([#255](https://github.com/GSTJ/react-native-magic-modal/issues/255)) ([86dd808](https://github.com/GSTJ/react-native-magic-modal/commit/86dd808b8307db29a5b03c1caeeeacf6049f3a2c)), closes [#248](https://github.com/GSTJ/react-native-magic-modal/issues/248) [#196](https://github.com/GSTJ/react-native-magic-modal/issues/196)
- **ci:** move onto the node 24 action majors and unbreak the docs build ([#251](https://github.com/GSTJ/react-native-magic-modal/issues/251)) ([65b5e2c](https://github.com/GSTJ/react-native-magic-modal/commit/65b5e2c699a02b8d8faaa5faab3762fc987e9e45)), closes [#241](https://github.com/GSTJ/react-native-magic-modal/issues/241) [#239](https://github.com/GSTJ/react-native-magic-modal/issues/239) [#224](https://github.com/GSTJ/react-native-magic-modal/issues/224) [#248](https://github.com/GSTJ/react-native-magic-modal/issues/248) [#244](https://github.com/GSTJ/react-native-magic-modal/issues/244) [#245](https://github.com/GSTJ/react-native-magic-modal/issues/245) [#249](https://github.com/GSTJ/react-native-magic-modal/issues/249)

### :stars: New Features :stars:

- **modal:** support gesture-handler 2.x alongside 3.x ([#257](https://github.com/GSTJ/react-native-magic-modal/issues/257)) ([939c982](https://github.com/GSTJ/react-native-magic-modal/commit/939c98215b52a567f40b235310270fb55ffe30b4))

## [8.0.0](https://github.com/GSTJ/react-native-magic-modal/compare/magic-modal-7.1.0...magic-modal-8.0.0) (2026-07-27)

### ⚠ BREAKING CHANGES

- **modal:** the `react-native-gesture-handler` peer range moves from
  `>=2.20.0` to `>=3.0.0`. `usePanGesture` only exists in 3.x, so there's no
  2.x-compatible path. The modal's own API is unchanged. A
  `GestureHandlerRootView` above the portal also becomes mandatory, since 3.x
  throws where 2.x only logged a warning. Expo SDK 55 still pins gesture-handler
  to 2.30, so Expo projects installing 3.x need it in `expo.install.exclude`, or
  can stay on `react-native-magic-modal` 7.x until Expo moves the pin.

### :hammer: Bug Fixes :hammer:

- **ci:** stop registering two [@typescript-eslint](https://github.com/typescript-eslint) plugin instances ([#236](https://github.com/GSTJ/react-native-magic-modal/issues/236)) ([a8ce4f9](https://github.com/GSTJ/react-native-magic-modal/commit/a8ce4f92768f0b78e7149b2f3ee7b2c492ec3ab1)), closes [#228](https://github.com/GSTJ/react-native-magic-modal/issues/228) [#233](https://github.com/GSTJ/react-native-magic-modal/issues/233) [#219](https://github.com/GSTJ/react-native-magic-modal/issues/219)
- **deps:** drop the duplicate hasown entry that broke the lockfile ([#220](https://github.com/GSTJ/react-native-magic-modal/issues/220)) ([76f92fe](https://github.com/GSTJ/react-native-magic-modal/commit/76f92fe2f1bf37c17a84115671bb81efcdb9e3f3))

### :stars: New Features :stars:

- **modal:** move swipe-to-dismiss onto gesture-handler's usePanGesture ([#241](https://github.com/GSTJ/react-native-magic-modal/issues/241)) ([61a4080](https://github.com/GSTJ/react-native-magic-modal/commit/61a4080c75af410c85a94346c6024b1c635d0016))

## [7.1.0](https://github.com/GSTJ/react-native-magic-modal/compare/magic-modal-7.0.3...magic-modal-7.1.0) (2026-07-25)

### :stars: New Features :stars:

- **modal:** add update() to swap a modal's content in place ([#217](https://github.com/GSTJ/react-native-magic-modal/issues/217)) ([24a939f](https://github.com/GSTJ/react-native-magic-modal/commit/24a939f2bf00d825c44e43b06bc4919759fce628))

### :hammer: Bug Fixes :hammer:

- **ci:** stop turbo from swallowing the docs task ([#215](https://github.com/GSTJ/react-native-magic-modal/issues/215)) ([18966e0](https://github.com/GSTJ/react-native-magic-modal/commit/18966e09880e26e6255af25ebc1eb119dade9e88))

## 7.0.3 (2026-07-25)

### :hammer: Bug Fixes :hammer:

- **modal:** stop the swipe gesture from eating taps ([#205](https://github.com/GSTJ/react-native-magic-modal/issues/205)) ([dc0a98c](https://github.com/GSTJ/react-native-magic-modal/commit/dc0a98c3413f85b0497ee07dd252ac34f464d83a))

### :link: Testing Updated :link:

- bring jest back to life and run it in CI ([#201](https://github.com/GSTJ/react-native-magic-modal/issues/201)) ([1864ea9](https://github.com/GSTJ/react-native-magic-modal/commit/1864ea9a74a803e2ead35e02a243b70e8d6721b6))

## 7.0.2 (2026-05-19)

### :curly_loop: Continuous Integrations :curly_loop:

- Published by the #192 release run, which pushed to npm and then failed before the version bump landed on main
- Align package.json version with npm publish 7.0.2

## 7.0.1 (2026-05-19)

### :curly_loop: Continuous Integrations :curly_loop:

- Fixed release-it git push + docs caching (#186)
- Align package.json version with npm publish 7.0.1

## 7.0.0 (2026-05-19)

### ⚠ BREAKING CHANGES

- Minimum peer versions bumped to align with the React Native ecosystem
  required by Reanimated 4 and `scheduleOnRN` (replacing the deprecated
  `runOnJS`):
  - `react` `>=18.0.0`
  - `react-native` `>=0.81.0`
  - `react-native-gesture-handler` `>=2.20.0`
  - `react-native-reanimated` `>=4.0.0`
  - `react-native-worklets` `>=0.5.0` (optional peer; ships with Reanimated 4)
- Consumers on older RN/Reanimated versions must upgrade their app before
  taking this release.

### :sparkles: Internal :sparkles:

- Replace deprecated `runOnJS` with `scheduleOnRN` from `react-native-worklets`.
- Kitchen-sink example bumped to Expo SDK 55 (RN 0.83.6, React 19.2,
  Reanimated 4.3.1) end-to-end.

## 6.0.2 (2024-12-16)

## 6.0.1 (2024-12-15)

## 6.0.0 (2024-12-15)

### ⚠ BREAKING CHANGES

- Removes individual `fullWindowOverlay` config from
  `magicModal.show`. Introduces `magicModal.enableFullWindowOverlay()` and
  `magicModal.disableFullWindowOverlay()` in order to control overlay
  behavior globally. This fixes exit animations on iOS.

### :dash: Code Improvements :dash:

- configure full window overlay globally to address exit animation issues ([#125](https://github.com/GSTJ/react-native-magic-modal/issues/125)) ([e797c20](https://github.com/GSTJ/react-native-magic-modal/commit/e797c20d9ca82aeeff68fcd1b5a7947bc98f57c7))

## 5.1.21 (2024-12-15)

## 5.1.20 (2024-10-19)

## 5.1.19 (2024-10-16)

## 5.1.18 (2024-10-16)

## 5.1.17 (2024-10-16)

### :hammer: Bug Fixes :hammer:

- cjs errors while importing & add fullWindowOverlay option ([#113](https://github.com/GSTJ/react-native-magic-modal/issues/113)) ([274a2a3](https://github.com/GSTJ/react-native-magic-modal/commit/274a2a3be8896eeb7568615a42a0323e6f2c78cb)), closes [#112](https://github.com/GSTJ/react-native-magic-modal/issues/112) [#110](https://github.com/GSTJ/react-native-magic-modal/issues/110) [#91](https://github.com/GSTJ/react-native-magic-modal/issues/91) [#89](https://github.com/GSTJ/react-native-magic-modal/issues/89)

## 5.1.16 (2024-07-19)

### :hammer: Bug Fixes :hammer:

- fix magic modal for react compiler users ([fee1735](https://github.com/GSTJ/react-native-magic-modal/commit/fee1735cc56371b809e8a8746cb8a04c31bdfc1a))

## 5.1.15 (2024-07-19)

## 5.1.14 (2024-07-18)

## 5.1.13 (2024-07-18)

## 5.1.12 (2024-07-18)

## 5.1.11 (2024-07-18)

## 5.1.10 (2024-07-18)

## 5.1.9 (2024-07-17)

## 5.1.8 (2024-07-17)

## 5.1.7 (2024-07-17)

## 5.1.6 (2024-07-17)

## 5.1.5 (2024-07-17)

## 5.1.4 (2024-07-17)

## 5.1.3 (2024-07-17)

## 5.1.2 (2024-07-17)

## 5.1.1 (2024-07-16)

## 5.1.0 (2024-07-16)

### :stars: New Features :stars:

- make example web-compatible & mark functions as worklets ([#92](https://github.com/GSTJ/react-native-magic-modal/issues/92)) ([713ee86](https://github.com/GSTJ/react-native-magic-modal/commit/713ee86c5f0c50b326fe06f9585f6bb4fbea8723))

## 5.0.3 (2024-07-16)

## 5.0.2 (2024-06-20)

## 5.0.1 (2024-06-20)

## 5.0.0 (2024-06-14)

### ⚠ BREAKING CHANGES

- improve type safety and docs

### :stars: New Features :stars:

- improve type safety and docs ([d3a7884](https://github.com/GSTJ/react-native-magic-modal/commit/d3a78842b7da87436abd163dc8ac0735a7264e7c))

## 4.0.8 (2024-06-14)

## 4.0.7 (2024-06-09)

## 4.0.6 (2024-06-08)

## 4.0.5 (2024-06-08)

### :curly_loop: Continuous Integrations :curly_loop:

- revert release config ([f6fb9a9](https://github.com/GSTJ/react-native-magic-modal/commit/f6fb9a907d59f35136d3baa51ebb1f3cbc22b084))

## [4.0.0](https://github.com/GSTJ/react-native-magic-modal/compare/2.1.8...4.0.5) (2024-06-08)

### ⚠ BREAKING CHANGES

- support multiple modals (#81)

### :stars: New Features :stars:

- support multiple modals ([#81](https://github.com/GSTJ/react-native-magic-modal/issues/81)) ([70da143](https://github.com/GSTJ/react-native-magic-modal/commit/70da143bb546cbb57ede01c9aca6b0595f34e0d1))

### :curly_loop: Continuous Integrations :curly_loop:

- fix pr checks ([#79](https://github.com/GSTJ/react-native-magic-modal/issues/79)) ([38df15f](https://github.com/GSTJ/react-native-magic-modal/commit/38df15f4b469a570a8d7a480c127a09fe9254245))

## 2.1.8 (2024-06-07)

## 2.1.7 (2024-06-07)

### :curly_loop: Continuous Integrations :curly_loop:

- validate versions on kitchen-sink are expo-compatible ([021a933](https://github.com/GSTJ/react-native-magic-modal/commit/021a933e07d442c6cc3065b5fed986b61cd8941e))

## 2.1.6 (2024-06-07)

## 2.1.5 (2024-06-06)

## 2.1.4 (2024-06-06)

## 2.1.3 (2024-06-06)

## 2.1.2 (2024-06-06)

## 2.1.1 (2024-06-06)

## [2.1.0](https://github.com/GSTJ/react-native-magic-modal/compare/2.0.13...2.1.0) (2024-06-06)

### :stars: New Features :stars:

- add web support ([befa910](https://github.com/GSTJ/react-native-magic-modal/commit/befa9105ad2fb5d0e49a128491f12f32c5c755d1))

### :curly_loop: Continuous Integrations :curly_loop:

- fix turbo json ([5c50641](https://github.com/GSTJ/react-native-magic-modal/commit/5c506410afc76d1348e414235476db9fa157d950))

## 2.0.13 (2024-06-04)

## 2.0.12 (2024-06-04)

## 2.0.11 (2024-06-03)

## 2.0.10 (2024-06-03)

## 2.0.9 (2024-06-01)

## 2.0.8 (2024-06-01)

## 2.0.7 (2024-05-29)

## 2.0.6 (2024-05-28)

## 2.0.5 (2024-05-28)

## 2.0.4 (2024-05-26)

## 2.0.3 (2024-05-25)

## [2.0.0](https://github.com/GSTJ/react-native-magic-modal/compare/1.0.0...2.0.0) (2024-05-25)

### ⚠ BREAKING CHANGES

- To preserve compatibility, swipeDirection "top" and
  "bottom" properties have been renamed back to "up" and "down". It also
  makes more sense overall.

### :stars: New Features :stars:

- rename swipeDirection "top" and "bottom" to "up" and "down" ([#52](https://github.com/GSTJ/react-native-magic-modal/issues/52)) ([c6107ff](https://github.com/GSTJ/react-native-magic-modal/commit/c6107ff49e197eba852cfa0cc0b23d6f2106b1e6))

### :curly_loop: Continuous Integrations :curly_loop:

- force docs gen ([633cf09](https://github.com/GSTJ/react-native-magic-modal/commit/633cf09da9c14d52f318315300d6014016312dfc))
- normalize repository settings ([4a827c5](https://github.com/GSTJ/react-native-magic-modal/commit/4a827c5ffd43c88da278fe81424df96c009ec3f6))

## 1.0.0 (2024-05-25)

### ⚠ BREAKING CHANGES

- Renames "direction" to "swipeDirection"

### :hammer: Bug Fixes :hammer:

- make modals appear on top of react-native modals & add new animation props ([#51](https://github.com/GSTJ/react-native-magic-modal/issues/51)) ([0cbca82](https://github.com/GSTJ/react-native-magic-modal/commit/0cbca82ca8033772d4bb996d26e7b1af7da7d76d))

## 0.3.3 (2024-05-24)

### Bug Fixes

- fix bugs and improve performance ([#40](https://github.com/GSTJ/react-native-magic-modal/issues/40)) ([2694e60](https://github.com/GSTJ/react-native-magic-modal/commit/2694e60291a4ede152168601d7c962b910885c43))

## 0.3.x (2024-04-24)

### Breaking Change

The component has been fully restructured not to depend on react-native-modal and have full control, using react-native-reanimated. Some properties are not available anymore, please refer to the docs for a full list of supported properties.

If you happened to use the library for an use-case not supported anymore, with no equivalent properties, please open an issue.
