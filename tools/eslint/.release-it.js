export default {
  plugins: {}, // No changelog plugin
  git: {
    commit: true,
    tag: true,
    push: true,
    requireCleanWorkingDir: false,
  },
  npm: {
    publish: true,
  },
  github: {
    release: false,
  },
};
