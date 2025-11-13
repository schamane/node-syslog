## MODIFIED Requirements

### Requirement: Multi-stage Dockerfile Optimization
The build system SHALL use Chainguard Wolfi OS containers with optimized multi-stage builds for enhanced security and performance.

#### Scenario: Chainguard Base Image Integration
- **WHEN** building container images with BuildKit enabled
- **THEN** system SHALL use cgr.dev/chainguard/node:latest-dev for build stages
- **AND** use cgr.dev/chainguard/node:latest for runtime stages
- **AND** leverage Wolfi OS package manager (apk) for dependencies
- **AND** achieve ~90% CVE reduction through distroless runtime
- **AND** minimize image size through multi-stage optimization

#### Scenario: Wolfi OS Package Management
- **WHEN** installing build dependencies
- **THEN** system SHALL use apk package manager instead of apt-get
- **AND** map Debian packages to Wolfi equivalents
- **AND** use --no-cache flag for minimal layer size
- **AND** verify all native build tools available in Wolfi

#### Scenario: Distroless Runtime Security
- **WHEN** creating production runtime images
- **THEN** system SHALL use distroless Chainguard runtime image
- **AND** remove all build dependencies from final stage
- **AND** run as non-root node user (UID 65532)
- **AND** include dumb-init for proper signal handling
- **AND** minimize attack surface through minimal footprint

### Requirement: Containerized Build Support
The build system SHALL support containerized builds using Chainguard Wolfi OS for environment consistency and security.

#### Scenario: Multi-stage Chainguard Build Architecture
- **WHEN** building in containerized environment
- **THEN** system SHALL use Chainguard dev image for build stage
- **AND** use Chainguard runtime image for final stage
- **AND** copy only compiled artifacts to runtime stage
- **AND** ensure build tools excluded from production image
- **AND** support both Docker and Podman runtimes

#### Scenario: Native Module Compilation with Wolfi
- **WHEN** compiling native C++ modules
- **THEN** system SHALL use Wolfi OS build toolchain
- **AND** provide all necessary build dependencies via apk
- **AND** support node-gyp compilation in Chainguard environment
- **AND** ensure N-API compatibility across Node.js versions
