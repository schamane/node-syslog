# Change: Production Binary Distribution

## Why
Enable seamless installation of node-syslog with pre-built binaries for ARM64/AMD64 architectures across multiple Node.js versions (22, 24, and 25) without requiring users to compile from source, while avoiding GitHub Releases hosting for binary distribution.

## What Changes
- Setup GitHub Actions for ARM64/AMD64 cross-compilation across Node.js 22, 24, and 25
- Implement binary distribution without GitHub Releases hosting
- Add installation validation script to verify binary integrity
- Create migration guide from old node-syslog package
- Ensure `pnpm install node-syslog` downloads pre-built binary automatically

## Impact
- Affected specs: `binary-distribution` (new capability)
- Affected code: GitHub Actions workflows, installation scripts, package.json configuration
- **BREAKING**: Changes binary distribution mechanism from GitHub Releases to alternative hosting