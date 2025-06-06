export default {
  plugins: {}, // No changelog plugin
  git: {
    commitMessage: "chore(release): magic eslint release v${version} [skip ci]",
    pushArgs: ["-o ci.skip"],
    commit: true,
    tag: true,
    push: true,
    requireCleanWorkingDir: false,
    tagName: "Magic ESLint v${version}",
  },
  npm: {
    publish: true,
  },
  github: {
    release: true,
    releaseName: "Magic ESLint Release ${version}",
  },
};
