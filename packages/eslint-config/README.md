# magic-eslint-config

> Shared ESLint configuration for Magic projects, including React, React Native, and Next.js.

## Features

- Consistent linting across all Magic projects
- Pre-configured for React, React Native, and Next.js
- Includes best practices and accessibility plugins
- Easy to extend or override

## Installation

Add the config to your project:

```bash
pnpm add -D @magic/eslint-config
# or
yarn add -D @magic/eslint-config
# or
npm install --save-dev @magic/eslint-config
```

## Usage

In your `eslint.config.js`:

```js
import baseConfig from "magic-eslint-config/base";

export default [...baseConfig];
```

## Available Configs

- `@magic/eslint-config/base` – Base config (JavaScript/TypeScript)
- `@magic/eslint-config/react` – For React projects
- `@magic/eslint-config/react-native` – For React Native projects
- `@magic/eslint-config/next` – For Next.js projects

## Extending

You can add your own rules or override any defaults in your project's ESLint config.
