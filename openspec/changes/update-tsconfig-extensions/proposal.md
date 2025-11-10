# Change: Update tsconfig.json to use @tsconfig/lts and @tsconfig/node-ts extensions

## Why
Modernize the TypeScript configuration by adopting community-maintained base configurations that provide better defaults, automatic updates for Node.js LTS support, and enhanced TypeScript 5.8+ features while maintaining the project's strict requirements.

## What Changes
- Add "@tsconfig/lts" and "@tsconfig/node-ts" as development dependencies
- Update tsconfig.json to extend from these base configurations
- Remove redundant compiler options that are already covered by base configs
- Maintain project-specific settings like outDir, rootDir, and include/exclude patterns
- **BREAKING**: Changes to TypeScript compilation behavior may affect strictness levels

## Impact
- Affected specs: build-system
- Affected code: tsconfig.json, package.json (devDependencies)
- Build process: Enhanced type checking with latest TypeScript features
- Development: Improved IDE support with standardized Node.js LTS configuration
