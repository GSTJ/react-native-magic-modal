/** @type {import("eslint").Linter.Config} */
const config = {
  parser: '@typescript-eslint/parser',
  rules: {
    'no-console': 'error',
    'import/no-duplicates': 'error',
    'import/no-anonymous-default-export': 'off',
    'import/order': 'off',
    'import/no-mutable-exports': 'off',
    'line-comment-position': 'off',
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          // Side effect imports.
          ['^\\u0000'],
          [
            '^react(/.*)?$',
            '^react-native(/.*)?$',
            '@testing-library/react-native',
          ],
          // Monorepo imports.
          ['^@magic(/.*)?$'],

          /** General imports https://github.com/lydell/eslint-plugin-simple-import-sort/blob/main/examples/.eslintrc.js */
          // Packages.
          // Things that start with a letter (or digit or underscore), or `@` followed by a letter.
          ['^@?\\w'],

          // Relative imports.
          ['^@/components(/.*)?$'],
          ['^./components(/.*)?$'],

          // Anything not matched in another group.
          ['^.@/(/.*)?$'],

          ['^@/types', '^\\u0000$'],

          // Parent imports. Put `..` last.
          ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
          // Other relative imports. Put same-folder imports and `.` last.
          ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          /** End of general imports */
          ['../style', '^./styles'],
        ],
      },
    ],
    'simple-import-sort/exports': 'error',
    'unused-imports/no-unused-imports': 'error',
    'prefer-arrow-functions/prefer-arrow-functions': [
      'error',
      {
        classPropertiesAllowed: false,
        disallowPrototype: false,
        returnStyle: 'unchanged',
        singleReturnOnly: false,
      },
    ],
  },
  plugins: [
    'simple-import-sort',
    'unused-imports',
    'import',
    'prefer-arrow-functions',
    '@typescript-eslint',
    'prettier',
    'eslint-comments'
  ],
  ignorePatterns: [
    '**/dist/**',
    '**/node_modules/**',
    '**/coverage/**',
    '**/.turbo/**',
  ],
}

module.exports = config
