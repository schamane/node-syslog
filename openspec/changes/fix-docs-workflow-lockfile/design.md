## Context
The GitHub Actions documentation workflow is failing due to multiple interconnected issues: missing package-lock.json, incorrect package manager configuration (npm vs pnpm), and missing native module compilation setup. The documentation build requires TypeScript compilation and native module building for TypeDoc API generation, but the current workflow doesn't handle platform-specific native dependencies properly.

## Goals / Non-Goals
- Goals:
  - Fix documentation deployment pipeline to work consistently
  - Use pnpm consistently across all workflows (project standard)
  - Ensure native module compilation for documentation builds
  - Generate and maintain proper lockfile for dependency caching
  - Support Linux ARM64/AMD64 native compilation in CI
- Non-Goals:
  - Change documentation structure or content
  - Modify Jekyll configuration or theme
  - Add support for other platforms in documentation builds

## Decisions
- Decision: Use pnpm-action-setup for proper pnpm integration in GitHub Actions
- Alternatives considered: Manual pnpm installation, npm-to-pnpm migration scripts
- Native compilation: Use standard node-gyp workflow with proper build tools
- Lockfile strategy: Generate pnpm-lock.yaml and commit to repository
- Build order: Native build → TypeScript build → Documentation build

## Risks / Trade-offs
- Native compilation time → Increased CI build time but necessary for API docs
- Lockfile maintenance → Need to keep pnpm-lock.yaml updated with dependencies
- Platform specificity → Documentation builds only work on Linux (matches project target)
- Build complexity → More steps in workflow but ensures reliable documentation generation

## Migration Plan
1. Generate pnpm-lock.yaml locally and commit to repository
2. Update GitHub Actions workflow to use pnpm instead of npm
3. Add native module compilation step before TypeScript build
4. Test workflow on pull request to validate changes
5. Merge to main to enable automatic documentation deployment

## Open Questions
- Should we cache native build artifacts between workflow runs?
- How to handle native compilation failures in documentation workflow?
- Should we separate documentation build from native build for better caching?