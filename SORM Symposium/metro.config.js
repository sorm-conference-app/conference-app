// metro.config.js
// https://github.com/supabase/supabase-js/issues/1400#issuecomment-2843653869
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = false;

module.exports = config;
