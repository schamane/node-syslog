## Context
The current Jekyll documentation setup has organizational issues that impact maintainability and build performance. Configuration files are scattered between root and docs directory, generated TypeDoc content is mixed with Jekyll source files, and the GitHub workflow unnecessarily compiles native modules during documentation generation.

## Goals / Non-Goals
- Goals: Improve organization, reduce build time, clarify separation of concerns
- Non-Goals: Change final documentation output, break existing URLs, modify content

## Decisions
- Decision: Consolidate all Jekyll files in docs/ directory for clear separation
- Decision: Skip native module compilation during docs generation using --ignore-scripts
- Decision: Keep TypeDoc output separate from Jekyll source files
- Alternatives considered: Keep current structure (rejected for maintainability), move to separate docs repo (rejected for complexity)

## Risks / Trade-offs
- Breaking change for contributors familiar with current structure → Mitigation: Update documentation and provide migration guide
- GitHub workflow changes may introduce new issues → Mitigation: Thorough testing and rollback plan
- Jekyll configuration updates may break existing functionality → Mitigation: Incremental changes with validation

## Migration Plan
1. Reorganize directory structure while preserving content
2. Update configuration files incrementally
3. Test Jekyll builds locally after each change
4. Update GitHub workflow and test in PR
5. Deploy and monitor for issues

## Open Questions
- Impact on existing documentation links and bookmarks
- Need to update any external references to file structure
- Effect on local development workflow