## Context
The current setup uses GitHub Releases for binary hosting, but we need to move to an alternative hosting solution while maintaining seamless installation experience across multiple Node.js versions and architectures.

## Goals / Non-Goals
- Goals: 
  - Pre-built binaries for ARM64/AMD64 on Node.js 22, 24, 25
  - Alternative binary hosting (not GitHub Releases)
  - Automatic binary download on `pnpm install`
  - Installation validation and integrity checks
- Non-Goals:
  - Support for Node.js < 22
  - Windows/macOS binary distribution
  - Custom binary hosting infrastructure

## Decisions
- Decision: Use npm package registry for binary hosting via node-pre-gyp alternative
- Alternatives considered: GitHub Releases (current), AWS S3, custom CDN
- Binary format: tar.gz with embedded checksums
- Validation: SHA256 checksums + native module load test

## Risks / Trade-offs
- npm registry size limits → Use compressed binaries and cleanup old versions
- Download reliability → Implement retry logic and fallback compilation
- Version compatibility → Test across all supported Node.js versions

## Migration Plan
1. Implement new hosting alongside existing GitHub Releases
2. Update package.json binary configuration
3. Test installation across all platforms
4. Switch off GitHub Releases hosting
5. Update documentation

## Open Questions
- Which alternative hosting solution provides best reliability?
- How to handle binary cleanup for old versions?
- Should we implement progressive rollout for new hosting?