// @ts-expect-error -- TODO: Convert to TS
export default (api) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["react-native-reanimated/plugin"],
  };
};
