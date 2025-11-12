# Change: Update tsconfig.json to use @tsconfig/recommended, @tsconfig/lts and @tsconfig/node-ts extensions

## Why
Modernize the TypeScript configuration by adopting community-maintained base configurations that provide better defaults, automatic updates for Node.js LTS support, enhanced TypeScript 5.8+ features, and TypeScript team recommended best practices while maintaining the project's strict requirements and TypeScript 5.9.3 version.

## What Changes
- Add "@tsconfig/recommended", "@tsconfig/lts" and "@tsconfig/node-ts" as development dependencies
- Update tsconfig.json to extend from all three base configurations in proper precedence order
- Remove redundant compiler options that are already covered by base configs (8 options)
- Maintain project-specific settings like outDir, rootDir, and include/exclude patterns
- **BREAKING**: Changes to TypeScript compilation behavior may affect strictness levels and module resolution
- **MAINTAIN**: TypeScript 5.9.3 version (no downgrade)

## Impact
- Affected specs: build-system
- Affected code: tsconfig.json, package.json (devDependencies)
- Build process: Enhanced type checking with latest TypeScript features and community best practices
- Development: Improved IDE support with standardized Node.js LTS configuration and TypeScript team recommendations
- Module System: Migration to nodenext with verbatimModuleSyntax and rewriteRelativeImportExtensions
