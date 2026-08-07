const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  // pdfjs-dist includes an optional Node-only canvas implementation. The web
  // statement importer only reads text, so it must not pull native canvas in.
  canvas: path.resolve(__dirname, 'shims/canvas.js'),
};

module.exports = config;
