// Expo + npm workspaces. Tell Metro to:
//   1. watch the monorepo root so changes in packages/* trigger reloads,
//   2. resolve modules from both the app's local node_modules AND the
//      hoisted root node_modules (where workspace symlinks live).
// Without this, `@clareo/design-system` resolves at install time but
// then 404s at bundle time because Metro doesn't follow the symlink.

const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Hoisted dependencies in a workspace can confuse Metro's hierarchical
// lookup; turning it off forces Metro to use exactly the paths above,
// which is the recommended setup for Expo + workspaces.
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
