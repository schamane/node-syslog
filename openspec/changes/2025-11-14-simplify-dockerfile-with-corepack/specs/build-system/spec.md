## MODIFIED Requirements

### Requirement: Multi-stage Dockerfile Optimization
The build system SHALL use simplified Dockerfile with corepack and direct vitest execution for enhanced maintainability and security.

#### Scenario: Corepack Package Management Integration
- **WHEN** building container images with BuildKit enabled
- **THEN** system SHALL use corepack enable pnpm instead of npm install -g pnpm
- **AND** remove root permissions requirement for package management
- **AND** leverage Node.js built-in package manager
- **AND** maintain pnpm functionality for dependency installation

#### Scenario: Direct Vitest Execution
- **WHEN** running tests in containerized environment
- **THEN** system SHALL use ./node_modules/.bin/vitest run directly
- **AND** remove complex test script wrappers
- **AND** maintain all vitest functionality (run, coverage, watch)
- **AND** ensure test results match current behavior

#### Scenario: Dockerfile Simplification
- **WHEN** optimizing Dockerfile for maintainability
- **THEN** system SHALL reduce multiple USER switches
- **AND** simplify build stages
- **AND** remove complex test runner setup
- **AND** optimize layer caching
- **AND** maintain security best practices

### Requirement: Containerized Build Support
The build system SHALL support simplified containerized builds using standard Node.js tools.

#### Scenario: Standard Node.js Practices
- **WHEN** building containerized environment
- **THEN** system SHALL use Node.js built-in tools (corepack)
- **AND** follow standard package management practices
- **AND** avoid custom package manager installations
- **AND** maintain compatibility with existing workflows

#### Scenario: Simplified Test Execution
- **WHEN** executing tests in containers
- **THEN** system SHALL use direct vitest execution
- **AND** remove wrapper script complexity
- **AND** maintain all test functionality
- **AND** ensure consistent behavior across environments
