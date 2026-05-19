export default {
  plugins: {
    "@release-it/conventional-changelog": {
      infile: "CHANGELOG.md",
      header: "# 🦄 Magic Modal Changelog 🪄",
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
      /**
       * Include commits scoped to (modal) and any commit carrying a
       * BREAKING CHANGE note (regardless of scope). This ensures that
       * unscoped `feat!:` / `fix!:` commits or commits with a
       * `BREAKING CHANGE:` footer still trigger a release, while
       * unrelated chore/deps noise without (modal) scope is ignored.
       * @param {{ header?: string, notes?: Array<{ title?: string, text?: string }> }} commit
       */
      commitFilter: (commit) => {
        if (commit.header?.includes("(modal)")) return true;
        if (
          commit.notes?.some((n) => /BREAKING[- ]CHANGE/i.test(n.title ?? ""))
        )
          return true;
        return false;
      },
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
    // The bump commit + tag exist only on the runner and are discarded when
    // the job ends; main stays at the pre-release version, and we sync via
    // a follow-up PR (same pattern used for #192).
    //
    // TODO: once GH_PAT is rotated with `contents: write` and granted
    // bypass on branch protection, flip `push` back to `true`.
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
