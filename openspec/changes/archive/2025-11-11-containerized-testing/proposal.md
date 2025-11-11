# Containerized Testing with Podman and Docker Compose

**Date**: November 11, 2025  
**Status**: Proposal  
**OpenSpec ID**: `containerized-testing`

## Why

The node-syslog project currently suffers from critical environment inconsistencies that impact code quality and reliability. Native C++ modules behave differently across platforms, creating a gap between development (macOS) and production (Linux) environments. This leads to false test results, deployment surprises, and increased maintenance overhead. Containerized testing eliminates these inconsistencies by providing identical Linux environments for all testing scenarios.

## Problem Statement

Currently, the node-syslog project uses local development environment testing which creates inconsistencies between macOS development and Linux production environments. This leads to:

1. **Platform Inconsistencies**: Tests run on macOS during development but target Linux in production
2. **Native Module Issues**: Different binary compilation and behavior across platforms
3. **CI/CD Gaps**: Local testing doesn't match GitHub Actions Linux environment
4. **Reproducibility Issues**: Development environment differs from deployment target

## What Changes

This change introduces a comprehensive containerized testing system that includes:

1. **Container Infrastructure**: Dockerfile, docker-compose.yml, and optimized variants for development and CI
2. **Testing Scripts**: New npm scripts and standalone tools for containerized test execution
3. **CI/CD Integration**: GitHub Actions workflow with containerized testing, multi-platform builds, and automated releases
4. **Validation Tools**: Test consistency validators, performance optimizers, and failure recovery testing
5. **Documentation**: Complete setup guides, usage examples, and migration instructions

## Proposed Solution

Implement a containerized testing system using Podman and Docker Compose that:

1. **Standardizes Testing Environment**: All tests run in identical Linux containers
2. **Eliminates Platform Differences**: macOS development, Linux testing via containers
3. **Improves CI/CD Consistency**: Local containers match GitHub Actions environment
4. **Enhances Reproducibility**: Identical environments across all development stages

## Scope

### In Scope
- Container-based testing with Podman (primary) and Docker (fallback)
- Docker Compose orchestration for multi-service testing
- Linux environment consistency for all tests
- Integration with existing Vitest test suite
- Native module compilation and testing in containers
- Development workflow integration

### Out of Scope
- Windows container support (outside project scope)
- Kubernetes deployment (beyond testing needs)
- Production containerization (testing focus only)
- Cross-platform container orchestration

## Success Criteria

1. **Environment Consistency**: 100% of tests run in identical Linux containers
2. **Developer Experience**: Seamless local development with containerized testing
3. **CI/CD Alignment**: Local containers match GitHub Actions environment
4. **Performance**: No significant slowdown in test execution
5. **Compatibility**: Works with both Podman and Docker Compose

## Technical Approach

### Primary Technology: Podman
- **Rootless containers** for better security and compatibility
- **Docker Compose compatibility** via `podman-compose`
- **Linux-native** container runtime
- **macOS integration** with seamless development experience

### Fallback: Docker Compose
- **Standard Docker** when Podman unavailable
- **Identical container definitions** for consistency
- **Seamless fallback** mechanism

### Integration Strategy
- **Existing test suite**: No changes to Vitest tests
- **Container orchestration**: Docker Compose for service management
- **Development workflow**: Simple commands for containerized testing
- **CI/CD alignment**: Match GitHub Actions container environment

## Benefits

1. **Consistency**: Eliminate macOS vs Linux differences
2. **Reproducibility**: Identical environments everywhere
3. **Quality**: Better testing of Linux-specific native modules
4. **Developer Experience**: Simple, reliable local testing
5. **CI/CD Alignment**: Local testing matches production environment
6. **Future-Proof**: Container-based development best practices

## Implementation Phases

1. **Phase 1**: Container Environment Setup
2. **Phase 2**: Docker Compose Configuration  
3. **Phase 3**: Test Integration and Workflow
4. **Phase 4**: Development Experience Optimization
5. **Phase 5**: Documentation and Validation

## Dependencies

### Technical Dependencies
- Podman 4.0+ (primary)
- Docker Compose 2.0+ (fallback)
- Docker 24.0+ (fallback)
- Existing Vitest test suite
- Native module build system

### Integration Dependencies
- Current package.json scripts
- Existing Vitest configuration
- GitHub Actions workflow
- Development toolchain

## Risks and Mitigations

### Risks
1. **Performance Overhead**: Container startup time
2. **Complexity**: Additional container management
3. **Learning Curve**: Team unfamiliarity with Podman
4. **Tooling Conflicts**: Existing development workflows

### Mitigations
1. **Optimized Containers**: Minimal base images and caching
2. **Simple Commands**: One-command testing workflows
3. **Documentation**: Comprehensive setup and usage guides
4. **Gradual Migration**: Phased implementation with fallbacks

## Success Metrics

1. **Test Environment Consistency**: 100% Linux container execution
2. **Developer Adoption**: Seamless integration with existing workflows
3. **CI/CD Alignment**: Zero environment differences
4. **Performance Impact**: <10% overhead in test execution time
5. **Reliability**: 99%+ successful container test runs