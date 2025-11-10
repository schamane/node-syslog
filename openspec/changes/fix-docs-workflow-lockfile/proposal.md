# Change: Fix Documentation Workflow Lockfile and Native Build Issues

## Why
GitHub Actions documentation deployment is failing due to multiple issues: missing package-lock.json, incorrect package manager (npm vs pnpm), and missing native module compilation setup. The documentation build requires TypeScript compilation and native module building, but current workflow doesn't handle platform-specific native dependencies properly.

## What Changes
- Update GitHub Actions docs workflow to use pnpm instead of npm
- Add native module compilation step for documentation builds
- Setup proper cross-compilation environment for Linux ARM64/AMD64
- Add pnpm-lock.yaml generation and caching
- Fix dependency installation commands to use pnpm
- Ensure native module builds before documentation generation

## Impact
- Affected specs: `documentation-site` (existing capability)
- Affected code: `.github/workflows/docs.yml`, add pnpm-lock.yaml
- Fixes critical documentation deployment pipeline
- Ensures native module compilation for API documentation generation