---
title: Debugging Guide
nav_order: 7
has_children: false
---

# Containerized Testing Debugging Guide

This guide provides comprehensive instructions for debugging containerized tests in the node-syslog project using VS Code.

## Overview

The project includes a fully configured containerized testing environment with integrated debugging support. This allows you to:
- Run tests in isolated container environments
- Set breakpoints and debug code running inside containers
- Maintain consistency between local and CI/CD environments
- Debug native C++ addon issues

## Prerequisites

1. **Container Engine**: Install Podman (recommended) or Docker
   ```bash
   # Podman (recommended)
   brew install podman
   
   # Docker (alternative)
   brew install --cask docker
   ```

2. **VS Code Extensions**: Install the recommended extensions from `.vscode/extensions.json`
   - Remote - Containers
   - Vitest Explorer
   - Docker
   - TypeScript and JavaScript Language Features

## Quick Start

### 1. Basic Debugging

1. Open the project in VS Code
2. Set breakpoints in your test files or source code
3. Press `F5` or go to Run and Debug panel
4. Select "Debug Tests in Container" configuration
5. Start debugging

### 2. Attaching to Running Container

1. Start a container with debug port exposed:
   ```bash
   # Using VS Code task
   Ctrl+Shift+P → "Tasks: Run Task" → "Start Container with Debug Port"
   
   # Or manually
   node scripts/debug-container-test.js test --debug
   ```

2. Set breakpoints in your code
3. Use "Attach to Container Node Process" debug configuration
4. Start debugging

## Debug Configurations

### Available Debug Configurations

| Configuration | Purpose | Use Case |
|---------------|---------|----------|
| Debug Tests in Container | Run tests with debugging | General test debugging |
| Debug Test Coverage in Container | Run coverage with debugging | Coverage analysis |
| Debug Native Tests in Container | Debug native addon | C++ addon issues |
| Attach to Container Node Process | Attach to running container | Long-running sessions |
| Debug Container with Inspector | Start with inspector enabled | Advanced debugging |
| Debug Vitest Directly (Local) | Local debugging (no container) | Quick local tests |
| Debug Container Test Script | Debug the container script itself | Script development |

### Configuration Details

#### Debug Tests in Container
```json
{
  "name": "Debug Tests in Container",
  "type": "node",
  "request": "launch",
  "program": "${workspaceFolder}/scripts/debug-container-test.js",
  "args": ["test", "--debug"],
  "env": {
    "NODE_ENV": "development"
  }
}
```

#### Attach to Container Node Process
```json
{
  "name": "Attach to Container Node Process",
  "type": "node",
  "request": "attach",
  "address": "localhost",
  "port": 9229,
  "localRoot": "${workspaceFolder}",
  "remoteRoot": "/app"
}
```

## VS Code Tasks

### Available Tasks

- **Container Test**: Run tests in container
- **Container Test Coverage**: Run coverage in container
- **Start Container with Debug Port**: Start container with debugging enabled
- **Build Debug Container**: Build container image for debugging

### Running Tasks

1. `Ctrl+Shift+P` → "Tasks: Run Task"
2. Select the desired task
3. Monitor output in the terminal panel

## Debugging Scenarios

### 1. Debugging Test Failures

When tests fail in the container:

1. Run with debug configuration:
   ```
   Debug Tests in Container
   ```

2. Set breakpoints at the failing test:
   ```typescript
   // test/syslog.test.ts
   test('should handle syslog operations', () => {
     debugger; // Set breakpoint here
     // Your test code
   });
   ```

3. Inspect variables and step through code

### 2. Debugging Native Addon Issues

For C++ addon problems:

1. Use "Debug Native Tests in Container" configuration
2. Set breakpoints in TypeScript code that calls native functions
3. Examine error messages and stack traces
4. Check native module loading

### 3. Performance Debugging

To analyze performance:

1. Start with debug port:
   ```
   Start Container with Debug Port
   ```

2. Attach with "Attach to Container Node Process"
3. Use VS Code's performance profiling tools
4. Analyze CPU and memory usage

## Container Debugging Tips

### Environment Variables

The debug container automatically sets:
- `CONTAINERIZED=true` - Indicates running in container
- `NODE_ENV=development` - Development mode
- `DEBUG=*` - Debug logging (when --debug flag used)
- `FORCE_COLOR=1` - Preserve terminal colors

### Port Forwarding

The debug configuration uses port 9229 for Node.js inspector:
- Container exposes port 9229
- Host forwards to localhost:9229
- VS Code attaches to this port

### Source Maps

Source maps are automatically configured:
- TypeScript source maps enabled
- Resolved to workspace folder
- Excludes node_modules for cleaner debugging

## Troubleshooting

### Common Issues

#### 1. "Cannot connect to debug target"
**Solution**: Ensure container is running with debug port:
```bash
node scripts/debug-container-test.js test --debug
```

#### 2. "Breakpoints not hit"
**Solutions**:
- Verify source maps are generated (`tsconfig.json` sourceMap: true)
- Check that breakpoints are set in `.ts` files, not compiled `.js`
- Ensure `NODE_ENV=development` is set

#### 3. "Container build fails"
**Solutions**:
- Check Dockerfile syntax
- Verify all required files are present
- Check container engine is running

#### 4. "Tests pass locally but fail in container"
**Solutions**:
- Check for platform-specific differences
- Verify file permissions in container
- Examine environment variables

### Debug Commands

#### Manual Container Debugging
```bash
# Build debug container
podman-compose build

# Run with debug port
podman-compose run --rm -p 9229:9229 node-syslog-test node --inspect=0.0.0.0:9229 ./node_modules/.bin/vitest run

# Attach with Node.js inspector
node inspect localhost:9229
```

#### Container Inspection
```bash
# List running containers
podman ps

# Inspect container
podman inspect <container-id>

# View container logs
podman logs <container-id>
```

## Advanced Usage

### Custom Debug Configurations

Create custom debug configurations in `.vscode/launch.json`:

```json
{
  "name": "Custom Debug Configuration",
  "type": "node",
  "request": "launch",
  "program": "${workspaceFolder}/scripts/debug-container-test.js",
  "args": ["test:custom", "--debug", "--verbose"],
  "env": {
    "CUSTOM_VAR": "value",
    "NODE_ENV": "development"
  }
}
```

### Multi-Container Debugging

For complex scenarios requiring multiple containers:

1. Modify `docker-compose.yml` to expose additional ports
2. Create attach configurations for each service
3. Use compound debug configurations

### Integration with CI/CD

The same containerized testing environment can be used in CI/CD:

```yaml
# .github/workflows/test.yml
- name: Run Containerized Tests
  run: node scripts/container-test.js
```

## Best Practices

1. **Always use containerized debugging** for consistency
2. **Set meaningful breakpoints** at logical boundaries
3. **Use environment variables** to control debug behavior
4. **Clean up containers** after debugging sessions
5. **Document custom configurations** for team sharing

## Getting Help

- Check the [VS Code Debugging Documentation](https://code.visualstudio.com/docs/editor/debugging)
- Review [Node.js Inspector Documentation](https://nodejs.org/en/docs/guides/debugging-getting-started/)
- Examine container logs for detailed error information
- Use the project's issue tracker for container-specific problems