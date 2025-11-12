# Change: Cleanup OpenSpec Archives, Build Artifacts, and Obsolete Files

## Why
The project contains obsolete debug files, build artifacts, unused scripts, and duplicate OpenSpec changes that create clutter. Build directories (`coverage/`, `build/`, `dist/`) contain generated files that should be gitignored, and several debug scripts are no longer referenced. Only truly obsolete files should be removed while preserving all implementation-relevant documentation and specifications.

## What Changes
- Remove duplicate `2025-11-12-fixed-github-pages-baseurl` change (superseded by `2025-11-12-fix-github-pages-baseurl`)
- Remove obsolete debug directories: `.ci-performance/`, `.failure-recovery-tests/`, `.test-consistency/`
- Remove build artifacts that should be gitignored: `coverage/`, `build/`, `dist/`
- Remove temporary debugging files: `docs/DEBUG.md`, `docs/test-generator.md`
- Remove obsolete backup folders: `docs/_includes_backup/`, `docs/_layouts_backup/` (git provides version control)
- **NEVER REMOVE**: `.plan/` directory (may contain important planning documents)
- **NEVER REMOVE**: `.opencode/` directory (may contain important configuration)
- **NEVER REMOVE**: `.env` file (may contain important environment configuration)
- Enable just-the-docs theme in `docs/_config.yml` (uncomment theme configuration)
- Remove custom layout files that are replaced by just-the-docs theme
- Update `.dockerignore` to exclude `.env` and `.opencode/` properly
- Add legacy version note to README.md for users needing older Node.js compatibility
- Add legacy version note to Jekyll documentation (getting-started.md) for migration guidance
- Remove unused debug scripts: `scripts/optimize-ci-performance.js`, `scripts/test-failure-recovery.js`, `scripts/validate-test-consistency.js`, `scripts/ci-container-test.js`, `scripts/debug-container-test.js`, `scripts/simulate-github-actions.js`, `scripts/test-jekyll-config.js`, `scripts/test-url-structure.js`
- Consolidate Docker files: Keep `Dockerfile.optimized` as `Dockerfile`, remove `Dockerfile`
- Consolidate compose files: Keep `docker-compose.optimized.yml` as `compose.yaml`, remove `docker-compose.yml`
- Remove deprecated `version: '3.8'` from compose file (not needed in modern Docker Compose)
- Update script references to use new Docker file names
- **KEEP**: All feature documentation (`CONTAINERIZED_TESTING.md`, `docs/typescript-configuration.md`, `docs/performance-summary.md`)
- **KEEP**: All actively used scripts (`scripts/container-test.js`, `scripts/performance-container-test.js`, `scripts/install.js`, `scripts/build-docs.js`, `scripts/validate-docs.js`)
- Consolidate remaining OpenSpec changes into cleaner archive structure
- Add archive index documentation for better navigation

## Impact
- Affected specs: None (cleanup only)
- Affected code: Obsolete debug directories, build artifacts, unused scripts, and OpenSpec archive structure
- **BREAKING**: Removes obsolete files and duplicate archived changes, but no functional impact
- Improves project cleanliness while preserving all feature implementation and specification documentation
- Ensures only gitignored build artifacts remain (they should be regenerated)
- Reduces confusion between temporary debug files and permanent documentation
- Streamlines OpenSpec change history for better navigation