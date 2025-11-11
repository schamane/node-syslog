# Containerized Testing Design Document

## Architecture Overview

The containerized testing system creates a consistent Linux environment for all testing activities, eliminating platform differences between macOS development and Linux production environments.

## Container Architecture

### Primary Runtime: Podman
```
┌─────────────────────────────────────────────────────────┐
│                macOS Development Host            │
│  ┌─────────────────────────────────────────┐    │
│  │         Podman Runtime              │    │
│  │  ┌─────────────────────────────┐   │    │
│  │  │    Linux Container        │   │    │
│  │  │  ┌─────────────────┐    │   │    │
│  │  │  │  Test Suite    │    │   │    │
│  │  │  │  - Vitest     │    │   │    │
│  │  │  │  - Native     │    │   │    │
│  │  │  │  - Build      │    │   │    │
│  │  │  └─────────────────┘    │   │    │
│  │  └─────────────────────────────┘   │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Fallback Runtime: Docker
```
┌─────────────────────────────────────────────────────────┐
│                macOS Development Host            │
│  ┌─────────────────────────────────────────┐    │
│  │         Docker Runtime               │    │
│  │  ┌─────────────────────────────┐   │    │
│  │  │    Linux Container        │   │    │
│  │  │  ┌─────────────────┐    │   │    │
│  │  │  │  Test Suite    │    │   │    │
│  │  │  │  - Vitest     │    │   │    │
│  │  │  │  - Native     │    │   │    │
│  │  │  │  - Build      │    │   │    │
│  │  │  └─────────────────┘    │   │    │
│  │  └─────────────────────────────┘   │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Container Configuration

### Base Image Strategy
- **Primary**: `ubuntu:22.04` - Matches GitHub Actions environment
- **Optimized**: Minimal image with only required dependencies
- **Cached**: Layer caching for faster startup times
- **Versioned**: Consistent across development and CI

### Service Architecture
```yaml
# docker-compose.yml structure
services:
  node-syslog-test:
    build: .
    volumes:
      - .:/app:cached
    environment:
      - NODE_ENV=test
    command: npm test
```

## Integration Points

### 1. Test Suite Integration
- **Vitest Configuration**: No changes required
- **Test Files**: Existing test suite works unchanged
- **Coverage Reports**: Generated in container, accessible on host
- **Native Testing**: Linux binary compilation and testing

### 2. Build System Integration
- **Native Compilation**: Linux binaries built in container
- **TypeScript Compilation**: Consistent across environments
- **Package Scripts**: Container-aware execution
- **Dependency Management**: Isolated container environment

### 3. Development Workflow Integration
- **Local Development**: One-command container testing
- **IDE Integration**: File watching through volume mounts
- **Hot Reload**: Test re-execution on file changes
- **Debugging**: Container debugging capabilities

## Container Orchestration

### Docker Compose Configuration
```yaml
version: '3.8'

services:
  test:
    build:
      context: .
      dockerfile: Dockerfile.test
    volumes:
      - .:/app:cached
      - node_modules:/app/node_modules
    environment:
      - NODE_ENV=test
      - CI=true
    command: npm run test:container
    working_dir: /app
```

### Multi-Stage Dockerfile
```dockerfile
# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Test stage  
FROM ubuntu:22.04
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++
COPY --from=builder /app/node_modules ./node_modules
COPY . .
```

## Development Experience

### Command Interface
```bash
# Primary testing command
npm run test:container

# Development with watching
npm run dev:container

# Build and test
npm run build:test:container

# Coverage in container
npm run test:coverage:container
```

### Volume Strategy
- **Source Code**: Mounted for live editing
- **Dependencies**: Cached in volume for performance
- **Build Artifacts**: Output to host for inspection
- **Coverage Reports**: Accessible on host machine

## Performance Optimizations

### Container Startup
- **Base Image Caching**: Pre-built base layers
- **Dependency Caching**: Volume for node_modules
- **Layer Reuse**: Optimized Dockerfile structure
- **Parallel Startup**: Concurrent service initialization

### Test Execution
- **In-Memory Testing**: Fast test execution
- **Parallel Tests**: Vitest worker threads
- **Selective Testing**: Targeted test execution
- **Result Caching**: Test result persistence

## Security Considerations

### Container Security
- **Rootless Mode**: Podman default security model
- **Minimal Privileges**: Only necessary capabilities
- **Read-Only Base**: Immutable base images
- **Dependency Scanning**: Regular security updates

### Host Security
- **Volume Isolation**: Controlled file system access
- **Network Isolation**: Container network management
- **Process Isolation**: Container process boundaries
- **Resource Limits**: CPU and memory constraints

## Monitoring and Observability

### Container Health
- **Startup Health**: Container readiness checks
- **Test Health**: Test suite success monitoring
- **Resource Usage**: CPU and memory tracking
- **Log Aggregation**: Container log collection

### Development Metrics
- **Test Performance**: Execution time tracking
- **Build Performance**: Compilation time monitoring
- **Container Efficiency**: Resource utilization metrics
- **Developer Experience**: Workflow satisfaction metrics