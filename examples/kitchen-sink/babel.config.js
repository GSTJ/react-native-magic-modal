// @ts-expect-error -- TODO: Convert to TS
module.exports = (api) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
  };
};
