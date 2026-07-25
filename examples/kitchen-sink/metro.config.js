// https://github.com/expo/router/blob/main/apps/demo/metro.config.js
// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;

// `expo/metro-config` already handles monorepos: it watches the workspace
// root and sets up node_modules resolution. Overriding any of that here just
// drifts from the defaults, which is what expo-doctor flags.
/** @type {any} */
const config = getDefaultConfig(projectRoot);

config.watcher.healthCheck.enabled = true;

const { FileStore } = require("metro-cache");
config.cacheStores = [
  // Ensure the cache isn't shared between projects
  // this ensures the transform-time environment variables are changed to reflect
  // the current project.
  new FileStore({ root: path.join(projectRoot, "node_modules/.cache/metro") }),
];

module.exports = config;
