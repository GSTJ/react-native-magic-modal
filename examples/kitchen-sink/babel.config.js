// @ts-expect-error -- untyped babel config; converting it to TS is its own change
module.exports = (api) => {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
  };
};
