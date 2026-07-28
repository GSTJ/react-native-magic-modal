// The commit types that reach the changelog, and which of them can move the
// version. `.release-it.js` and `tools/changelog-check.mjs` both import this
// list, so the check can't pass against a policy the release doesn't use.
//
// Section names are this repo's own. They are what the shipped release bodies
// use, and renaming them would make CHANGELOG.md read as two projects.
//
// What changed, and why:
//
//   `effect` replaces `hidden`. conventional-changelog-conventionalcommits 10
//   reads `effect` and nothing else — `hidden: true` is dead config there. So
//   `chore` was never actually hidden. The 9.0.1 release body lists 20
//   dependency and CI chores under ":curly_loop: What a drag! :curly_loop:",
//   off an entry this file marked `hidden: true`. The list now says what the
//   generator does.
//
//   `build` and `docs` were absent from the list entirely, and a type the list
//   doesn't mention is discarded, so 9.0.1 shipped without the two `docs(ci)`
//   commits in its range (#298 and #300). Both types change what ships:
//   `dist/` is the whole tarball and bunchee's config decides its contents,
//   and README.md is packed alongside it.
//
//   `ci`, `style` and `test` move to hidden. `files` is `["dist"]`, so
//   `.github/`, source formatting and `src/**` tests cannot reach a consumer.
//   `ci` in particular was rendering its own section while the dependency
//   chores that actually move `dist/` were meant to be hidden, which is
//   backwards.
//
//   The `breaking` entry is gone. `breaking:` is not a conventional-commits
//   type, no commit in this repo has ever used it, and the section it pointed
//   at is not the one breaking changes render under — the writer hardcodes
//   that heading and reaches it from a note, not from a type.
//
// The bump/changelog split is the point of `effect`. Only `feat`, `fix`,
// `perf` and `revert` can raise a version. `build`, `refactor`, `chore` and
// `docs` render without bumping, so a month of dependency chores is still a
// patch. This repo has published two wrong majors off a miscomputed bump
// (8.0.0 and 9.0.0, see the tagOpts comment in .release-it.js), and the
// pipeline publishes to npm with no human in the loop, so widening what
// renders must not widen what bumps.
//
// Breaking changes are not configurable here and don't need to be. The
// preset's writer sets `discard = false` the moment a commit carries a note,
// so a `BREAKING CHANGE:` footer or a `!` renders its own section whatever
// type it hangs off, hidden ones included. tools/changelog-check.mjs is the
// control for that.
import createPreset from "conventional-changelog-conventionalcommits";

/** @type {import("conventional-changelog-conventionalcommits").CommitType[]} */
export const TYPES = [
  { type: "fix", section: ":hammer: Bug Fixes :hammer:", effect: "bump" },
  { type: "feat", section: ":stars: New Features :stars:", effect: "bump" },
  { type: "feature", section: ":stars: New Features :stars:", effect: "bump" },
  {
    type: "refactor",
    section: ":dash: Code Improvements :dash:",
    effect: "changelog",
  },
  { type: "perf", section: ":dash: Code Improvements :dash:", effect: "bump" },
  { type: "revert", section: ":x: Removed :x:", effect: "bump" },
  {
    type: "chore",
    section: ":curly_loop: What a drag! :curly_loop:",
    effect: "changelog",
  },
  {
    type: "build",
    section: ":package: Build System :package:",
    effect: "changelog",
  },
  {
    type: "docs",
    section: ":books: Documentation :books:",
    effect: "changelog",
  },
  {
    type: "ci",
    section: ":curly_loop: Continuous Integrations :curly_loop:",
    effect: "hidden",
  },
  { type: "style", section: ":lipstick: Styles :lipstick:", effect: "hidden" },
  { type: "test", section: ":link: Testing Updated :link:", effect: "hidden" },
];

export default createPreset({ types: TYPES });
