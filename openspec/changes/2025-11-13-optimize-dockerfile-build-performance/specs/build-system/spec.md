## MODIFIED Requirements

### Requirement: Multi-stage Dockerfile Optimization
The build system SHALL use multi-stage Dockerfile with optimized layer caching, BuildKit cache mounts, and security best practices for containerized builds.

#### Scenario: BuildKit cache mount integration
- **WHEN** building container images with BuildKit enabled
- **THEN** system SHALL use cache mounts for apt package cache
- **AND** use cache mounts for pnpm store
- **AND** reduce redundant package downloads across builds
- **AND** improve build performance by 15-25%

#### Scenario: Layer consolidation for faster builds
- **WHEN** optimizing Dockerfile layers
- **THEN** system SHALL combine related COPY commands
- **AND** remove redundant file system operations
- **AND** minimize image layer count
- **AND** improve Docker layer caching efficiency

#### Scenario: Reproducible builds with pinned dependencies
- **WHEN** building for production or CI
- **THEN** system SHALL pin pnpm to version 10.20.0
- **AND** use NODE_VERSION build arg with default of 22
- **AND** ensure consistent builds across environments
- **AND** support Node.js version flexibility when needed

#### Scenario: Security-hardened runtime image
- **WHEN** creating production runtime images
- **THEN** system SHALL remove build dependencies from final stage
- **AND** run as non-root user (node:node)
- **AND** add OCI security labels/metadata
- **AND** minimize attack surface

### Requirement: Containerized Build Support
The build system SHALL support containerized builds for environment consistency with optimized performance and security.

#### Scenario: Docker-based Linux Container Builds with BuildKit
- **WHEN** building in containerized environment
- **THEN** system SHALL use Docker for Linux container builds
- **AND** provide consistent build toolchain
- **AND** support multi-stage optimization with BuildKit features
- **AND** enable layer caching and cache mounts
- **AND** optimize for both development and CI workflows

#### Scenario: Health check configuration alignment
- **WHEN** configuring container health checks
- **THEN** system SHALL align HEALTHCHECK timeout with compose.yaml (10s)
- **AND** provide appropriate start period and retry settings
- **AND** ensure container monitoring reliability
