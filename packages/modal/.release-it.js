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
      preset: {
        name: "conventionalcommits",
        types: [
          {
            type: "fix",
            section: ":hammer: Bug Fixes :hammer:",
            hidden: false,
          },
          {
            type: "feat",
            section: ":stars: New Features :stars:",
            hidden: false,
          },
          {
            type: "refactor",
            section: ":dash: Code Improvements :dash:",
            hidden: false,
          },
          {
            type: "perf",
            section: ":dash: Code Improvements :dash:",
            hidden: false,
          },
          {
            type: "test",
            section: ":link: Testing Updated :link:",
            hidden: false,
          },
          {
            type: "breaking",
            section: ":boom: BREAKING CHANGE :boom:",
            hidden: false,
          },
          {
            type: "revert",
            section: ":x: Removed :x:",
            hidden: false,
          },
          {
            type: "ci",
            section: ":curly_loop: Continuous Integrations :curly_loop:",
            hidden: false,
          },
          {
            type: "chore",
            section: ":curly_loop: What a drag! :curly_loop:",
            hidden: true,
          },
        ],
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
