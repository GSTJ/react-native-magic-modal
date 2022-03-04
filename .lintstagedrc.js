module.exports = {
  '*.js': ['eslint --fix', 'git add'],
  '*.(ts|tsx)': [() => 'tsc', 'eslint --fix', 'git add'],
};
