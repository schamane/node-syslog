# Change: Migrate to Chainguard Wolfi OS Containers

## Why
Migrate from Debian-based Node.js containers to Chainguard Wolfi OS containers to achieve ~90% reduction in CVEs, smaller image sizes, and automated security patching. Chainguard's distroless runtime images provide minimal attack surface while Wolfi OS offers comprehensive package management for build stages.

## What Changes
- **Base Image Migration**: Replace `node:22-bookworm-slim` with `cgr.dev/chainguard/node:latest-dev` and `cgr.dev/chainguard/node:latest`
- **Package Manager**: Replace `apt-get` with Wolfi's `apk` package manager
- **Multi-stage Optimization**: Use dev image for builds, distroless image for runtime
- **Security Hardening**: Add dumb-init for proper signal handling, leverage Chainguard's security features
- **Project Guidelines**: Update project.md to mandate Chainguard containers

**Affected Specs**: `build-system`, `testing-system`  
**Affected Code**: `Dockerfile`, `compose.yaml`, `project.md`

## Impact
- **Security**: ~90% reduction in CVEs through distroless runtime images
- **Image Size**: Significant reduction through minimal Wolfi OS base
- **Maintenance**: Daily automated security updates from Chainguard
- **Compliance**: SBOMs and signatures included with Chainguard images
- **Performance**: Faster container startup with minimal footprint
