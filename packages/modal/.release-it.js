import createPreset from "conventional-changelog-conventionalcommits";

// One list, used three times: as the preset the plugin loads, to build the
// preset we borrow `whatBump` from below, and by tools/changelog-check.mjs.
// It lives in tools/changelog-preset.mjs so the check can't pass against a
// policy the release doesn't use — that file also explains what each `effect`
// buys.
import { TYPES as types } from "./tools/changelog-preset.mjs";

// Squash-merging a PR puts the PR description in the commit body, and Renovate
// PR descriptions quote the upstream project's changelog verbatim. Several
// merged commits therefore carry other projects' release notes, breaking-change
// sections included: `chore(deps): update dependency uuid to v14` (#295) has
// three `##### ⚠ BREAKING CHANGES` headings in its body.
//
// Those headings happen to be inert. conventional-commits-parser only reads a
// note from `^[\s|*]*(BREAKING CHANGE|BREAKING-CHANGE)[:\s]+`, and the heading
// is both hash-prefixed and plural, so it misses on two counts. Measured, not
// assumed. What is *not* inert is an upstream project that hand-writes
// `BREAKING CHANGE: ...` at the start of a line in its release notes. Renovate
// would quote that verbatim too, the parser would take it, and the next release
// would compute a major off a dependency chore — publishing a bogus 10.0.0 to
// npm and writing someone else's breaking changes into this changelog.
//
// This repo has already shipped two wrong majors from bump miscomputation
// (8.0.0 and 9.0.0, see the tagOpts comment below), and the pipeline publishes
// to npm without a human in the loop, so a wrong major is not something that
// can be taken back. Hence the guard.
//
// The discriminator is authorship, not text. `%an` on a squash merge is the PR
// author — `renovate[bot]` for a bot PR — and it comes off the commit object,
// so nothing written in a PR description can forge it. Matching on the shape of
// the prose instead would be a guessing game against whatever upstream writes
// next.
const BOT_AUTHORS = new Set([
  "renovate[bot]",
  "dependabot[bot]",
  "github-actions[bot]",
]);

// `feat!:`, `fix(deps)!:`. A subject-line marker is deliberate in a way quoted
// prose is not, so it keeps counting no matter who authored the commit. It is
// also the escape hatch for the one case where a bot-authored commit really is
// breaking: a human pushing onto a Renovate branch writes the `!` and the bump
// still goes major.
const BREAKING_MARKER = /^[a-zA-Z]+(\([^)]*\))?!:/;

/**
 * A commit as conventional-commits-parser hands it to `whatBump`. `authorName`
 * is there because of the `commitsOpts.format` below; without it the field is
 * simply absent, which the guard reads as "not a bot".
 *
 * @typedef {{
 *   authorName?: string;
 *   header?: string;
 *   notes?: unknown[];
 * }} ParsedCommit
 */

/**
 * Drop breaking notes that a bot's commit body picked up from somewhere else.
 * Humans are never touched, so a hand-written `BREAKING CHANGE:` footer behaves
 * exactly as it did before this guard existed. An author we don't recognise is
 * treated as a human: the failure worth having here is over-counting a breaking
 * change, never silently swallowing one.
 *
 * @param {ParsedCommit} commit
 * @returns {ParsedCommit}
 */
const dropQuotedNotes = (commit) => {
  if (!BOT_AUTHORS.has(commit.authorName ?? "")) return commit;
  if (BREAKING_MARKER.test(commit.header ?? "")) return commit;
  if (!commit.notes?.length) return commit;
  return { ...commit, notes: [] };
};

// `whatBump` borrowed rather than reimplemented. It reads `types` to decide
// which commits move the version at all, and rewriting that by hand here is how
// a config quietly stops doing what its comment claims — which is the whole
// story of the 8.0.0 and 9.0.0 releases.
//
// The double cast is upstream's typing gap: the preset publishes
// `createPreset(config?): {}`, so its own return value doesn't describe the
// `whatBump` it demonstrably returns.
const preset =
  /** @type {{ whatBump: (commits: ParsedCommit[]) => unknown }} */ (
    /** @type {unknown} */ (await createPreset({ types }))
  );

export default {
  plugins: {
    "@release-it/conventional-changelog": {
      infile: "CHANGELOG.md",
      header: "# 🦄 Magic Modal Changelog 🪄",
      // Where the recommended bump starts counting from. Without it,
      // conventional-recommended-bump falls back to `git-semver-tags` with an
      // empty prefix, which can't parse `magic-modal-8.0.0` and skips every
      // release tag this repo has. It then lands on the old `v*` tags from the
      // 6.x days, and the range stretches back 53 commits.
      //
      // That's how 8.1.0 came out as 9.0.0: the range swept up
      // `feat(modal)!: move swipe-to-dismiss onto gesture-handler's
      // usePanGesture` (#241), which was already released as 8.0.0, and its
      // breaking marker forced a second major. 8.0.0 itself came out of the
      // same fault. Every release was going to be a major until this was set.
      //
      // The plugin does derive a `tagPrefix` from `git.tagName` below, but it
      // only uses it for the changelog, never for the bump. `tagOpts` is what
      // reaches the bumper.
      tagOpts: { prefix: "magic-modal-" },
      // The bumper's default format is `%B%n-hash-%n%H`. `-fieldName-` lines
      // are how conventional-commits-parser exposes extra git fields on the
      // parsed commit (`fieldPattern`), so appending one gets us `authorName`
      // for the guard above. `-hash-` is kept because dropping it would take
      // `commit.hash` with it.
      //
      // Bump path only. The changelog generator takes `gitRawCommitsOpts`, not
      // this, so the rendered notes are unaffected.
      commitsOpts: { format: "%B%n-hash-%n%H%n-authorName-%n%an" },
      whatBump: (/** @type {ParsedCommit[]} */ commits) =>
        preset.whatBump(commits.map(dropQuotedNotes)),
      preset: {
        name: "conventionalcommits",
        types,
      },
      // There used to be a `commitFilter` here meant to keep the changelog to
      // (modal)-scoped and breaking commits. @release-it/conventional-changelog
      // accepts `preset`, `context`, `gitRawCommitsOpts`, `parserOpts`,
      // `writerOpts` and `whatBump`, so it was silently dropped: the 7.1.0
      // release notes list `fix(ci): stop turbo from swallowing the docs task`,
      // which the filter claimed to exclude.
      //
      // Whether a release happens at all is decided by the "Determine next
      // version" probe in .github/workflows/release.yml, which does check for
      // (modal) scope and BREAKING CHANGE footers. Once a release is running,
      // every non-hidden commit in range belongs in the notes, so there's
      // nothing left for a filter to do.
    },
  },
  git: {
    commitMessage: "chore(release): magic modal release v${version} [skip ci]",
    pushArgs: ["-o ci.skip"],
    commit: true,
    tag: true,
    // We intentionally do NOT push the release commit/tag back to main from
    // CI. The repository's GH_PAT secret (dated 2024) is currently rejected
    // by branch protection ("Permission to GSTJ/react-native-magic-modal.git
    // denied to GSTJ"), which causes the entire publish workflow to fail
    // AFTER npm publish has already happened — leaving npm and main out of
    // sync and bricking the workflow forever after.
    //
    // Keeping `commit: true` and `tag: true` so the @release-it/github plugin
    // still has a tag to attach the GitHub Release to within the runner.
    // The bump commit + tag exist only on the runner. The "Open version sync
    // PR" step in .github/workflows/release.yml pushes that commit to a branch
    // and opens a PR, so the version and CHANGELOG.md still reach main. Main
    // stays at the pre-release version until that PR merges.
    //
    // The way out: once GH_PAT is rotated with `contents: write` and granted
    // bypass on the main ruleset, flip `push` back to `true` and drop the
    // sync-PR step.
    push: false,
    requireCleanWorkingDir: false,
    tagName: "magic-modal-${version}",
  },
  npm: {
    publish: true,
  },
  github: {
    release: true,
    releaseName: "Magic Modal Release ${version}",
  },
};
