/* See https://orm.drizzle.team/docs/get-started/expo-new */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // Include Reanimated plugin first as recommended for production/web builds
    // to ensure worklets are transformed before other plugins. This fixes
    // subtle issues on initial web load (e.g., header animations not applying
    // causing the logo to disappear until navigation).
    plugins: [
      "react-native-reanimated/plugin",
      ["inline-import", { extensions: [".sql"] }],
    ],
  };
};
