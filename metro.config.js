const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

// Normalizar drive letter para maiusculas (fix Windows case-sensitivity bug)
function normalizePath(p) {
  if (process.platform === 'win32' && p && p[1] === ':') {
    return p[0].toUpperCase() + p.slice(1);
  }
  return p;
}

const projectRoot = normalizePath(path.resolve(__dirname));

const config = getDefaultConfig(projectRoot);
config.projectRoot = projectRoot;
config.watchFolders = [projectRoot];

// Override resolver para normalizar paths no Windows
const originalGetTransformOptions = config.transformer && config.transformer.getTransformOptions;
config.resolver = {
  ...config.resolver,
  resolveRequest: (context, moduleName, platform) => {
    const normalizedContext = {
      ...context,
      originModulePath: normalizePath(context.originModulePath),
    };
    return context.resolveRequest(normalizedContext, moduleName, platform);
  },
};

module.exports = withNativeWind(config, { input: './global.css' });