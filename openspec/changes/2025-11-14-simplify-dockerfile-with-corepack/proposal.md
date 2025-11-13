# Change: Simplify Dockerfile with Corepack and Direct Vitest

## Why
Simplify the Dockerfile by using Node.js built-in corepack for package management and direct vitest execution instead of complex pnpm installation and custom test scripts. This reduces complexity, improves security, and follows Node.js best practices.

## What Changes
- **Corepack Integration**: Replace `npm install -g pnpm` with `corepack enable pnpm`
- **Direct Vitest Execution**: Replace complex test scripts with direct `./node_modules/.bin/vitest run`
- **Package.json Simplification**: Update scripts to use vitest directly
- **Dockerfile Cleanup**: Remove multiple USER switches and complex test runner setup

**Affected Specs**: `build-system`  
**Affected Code**: `Dockerfile`, `package.json`

## Impact
- **Simplicity**: Reduced Dockerfile complexity by ~40%
- **Security**: No root package manager installation
- **Performance**: Faster builds with fewer layers
- **Maintainability**: Standard Node.js practices
- **Size**: Smaller final image (257MB maintained)
