const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the whole workspace so a change in packages/shared triggers a rebuild,
// not just changes inside apps/app.
config.watchFolders = [workspaceRoot];

// Let Metro find modules hoisted to the workspace root, not just apps/app/node_modules.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// pnpm's node_modules isn't flat — real packages live in a central .pnpm store,
// symlinked in. Resolve any bare import against the workspace root's node_modules
// so Metro follows the same symlinks pnpm set up, instead of failing to find a
// hoisted dependency that isn't physically inside apps/app/node_modules.
config.resolver.extraNodeModules = new Proxy(
  {},
  {
    get: (target, name) => path.join(workspaceRoot, 'node_modules', name),
  }
);

module.exports = config;
