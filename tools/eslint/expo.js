/** @type {import("eslint").Linter.Config} */
const config = {
    rules: {
        'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
        'react-hooks/exhaustive-deps': 'error', // Checks effect dependencies
        'jsx-a11y/no-autofocus': 'off',
        'react/style-prop-object': 'off',
        'react/display-name': 'off',
        'react/self-closing-comp': 'error',
    },
    plugins: [
        'react',
        'react-hooks',
    ],
}

module.exports = config
