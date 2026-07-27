// @ts-expect-error -- untyped babel config; converting it to TS is its own change
export default (api) => {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["react-native-reanimated/plugin"],
  };
};
