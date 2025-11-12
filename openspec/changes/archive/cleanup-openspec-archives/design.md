## Context
The project contains build artifacts that should be gitignored, obsolete debug directories with temporary reports, unused scripts, and duplicate OpenSpec changes. These files create clutter but we must be careful to preserve all files that are relevant for feature implementation, specifications, or documentation. Only truly obsolete files and build artifacts should be removed.

## Goals / Non-Goals
- Goals: Remove build artifacts, obsolete debug files, unused scripts, eliminate duplicate OpenSpec changes, improve project organization while preserving all implementation-relevant content
- Non-Goals: Modify any active specifications, change functional behavior, alter current development workflow, remove user-facing documentation or actively used scripts

## Decisions
- Decision: Remove build artifacts (`coverage/`, `build/`, `dist/`) as they should be regenerated and gitignored
- Decision: Remove debug report directories (`.ci-performance/`, `.failure-recovery-tests/`, `.test-consistency/`) as they contain only temporary reports
- Decision: Remove temporary debug files (`docs/DEBUG.md`, `docs/test-generator.md`) that served short-term debugging purposes
- Decision: Remove unused scripts that are not referenced in package.json or current workflows
- Decision: Consolidate Docker files - keep optimized versions as primary files
- Decision: Rename `docker-compose.optimized.yml` to `compose.yaml` for modern naming convention
- Decision: Rename `Dockerfile.optimized` to `Dockerfile` as it's the superior implementation
- Decision: Enable just-the-docs theme for better documentation presentation and maintenance
- Decision: Remove custom layout files in favor of just-the-docs theme components
- Decision: **NEVER REMOVE** `.plan/` directory (may contain important planning documents)
- Decision: **NEVER REMOVE** `.opencode/` directory (may contain important configuration)
- Decision: **NEVER REMOVE** `.env` file (may contain important environment configuration)
- Decision: Add clear legacy version guidance for users needing older Node.js compatibility
- Decision: Provide migration path to 'modern-syslog' for users with requirements below Node.js 22 LTS
- Decision: Update `.dockerignore` to properly exclude sensitive and non-project files
- Decision: **KEEP** all actively used scripts referenced in package.json (`container-test.js`, `install.js`, `build-docs.js`, `validate-docs.js`)
- Decision: **KEEP** all feature documentation (`CONTAINERIZED_TESTING.md`, `docs/typescript-configuration.md`, `docs/performance-summary.md`) as they document current features
- Decision: **KEEP** implementation scripts (`scripts/performance-container-test.js`) as they are part of testing system
- Decision: Remove duplicate `2025-11-12-fixed-github-pages-baseurl` as it's superseded by `2025-11-12-fix-github-pages-baseurl`
- Decision: Keep all other archived changes as they represent unique work items

## Risks / Trade-offs
- Risk: Accidentally removing implementation-relevant files → Mitigation: Conservative approach, verify package.json references before removal
- Risk: Breaking references in documentation → Mitigation: Search for and update any internal links before removal
- Risk: Removing build artifacts that might be needed → Mitigation: Verify they can be regenerated through standard build processes
- Risk: Losing debugging context for future issues → Mitigation: Keep all feature documentation and implementation scripts
- Trade-off: Cleaner project structure vs. preservation of potentially useful files

## Migration Plan
1. Carefully categorize files: build artifacts, obsolete temporary reports, unused scripts vs. actively used files
2. Verify package.json script references to identify actively used scripts
3. Remove build artifacts (they should be gitignored and regenerated)
4. Remove only confirmed obsolete debug report directories and temporary files
5. Remove unused scripts that have no package.json references
6. Compare duplicate OpenSpec changes to ensure no unique content is lost
7. Remove redundant change directory
8. Create archive index and README documentation
9. Validate all package.json scripts and project functionality still work correctly
10. Document conservative cleanup process for future reference

## Open Questions
- What criteria should be used to distinguish temporary debug files from feature documentation?
- Should there be a policy for automatic cleanup of temporary report directories?
- How can we ensure future cleanup efforts remain conservative and preserve implementation-relevant content?
- Should build artifacts be automatically cleaned by CI/CD pipelines?