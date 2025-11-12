# Change: Optimize Jekyll Documentation Structure and Workflow

## Why
The current Jekyll GitHub Pages setup has scattered configuration files, mixed content types, and unnecessary native module compilation during documentation builds, leading to slower builds and confusing organization.

## What Changes
- Reorganize Jekyll files into proper directory structure
- Separate generated TypeDoc API docs from Jekyll source content  
- Move Jekyll configuration files from root to docs directory
- Optimize GitHub workflow to skip native module compilation
- Add pnpm configuration with onlyBuiltDependencies to eliminate approve-builds step
- Improve caching and build performance

## Impact
- Affected specs: documentation-site
- Affected code: .github/workflows/docs.yml, docs/ directory structure, _config.yml, _data/
- **BREAKING**: Changes Jekyll source directory structure but preserves final output