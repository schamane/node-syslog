---
title: Installation Guide
has_children: false
parent: Documentation
nav_order: 3
---

# Installation Guide

This guide covers installing and setting up node-syslog in your project.

## Prerequisites

- **Node.js** 22.0.0 or higher
- **Linux** operating system (x64/ARM64)
- **C++ compiler** and development tools (for source compilation)

## Platform Support

| Platform | Architecture | Status |
|----------|-------------|--------|
| Linux | x64 (AMD64) | ✅ Supported |
| Linux | ARM64 | ✅ Supported |
| macOS | Any | ❌ Not supported |
| Windows | Any | ❌ Not supported |

## Installation Methods

### Method 1: NPM (Recommended)

```bash
npm install node-syslog
```

### Method 2: pnpm

```bash
pnpm add node-syslog
```

### Method 3: Yarn

```bash
yarn add node-syslog
```

## Binary vs Source Installation

### Binary Installation (Default)

The package includes precompiled binaries for supported platforms:

```bash
npm install node-syslog
# Downloads appropriate binary automatically
```

### Source Installation (Fallback)

If no binary is available for your platform, the package falls back to source compilation:

```bash
# Ensure you have build tools installed
sudo apt-get install build-essential python3  # Ubuntu/Debian
sudo yum install gcc-c++ python3              # CentOS/RHEL
sudo dnf install gcc-c++ python3              # Fedora

# Install the package (will compile from source)
npm install node-syslog
```

## Development Dependencies

For development, you'll need additional tools:

```bash
# Install development dependencies
npm install --dev

# or with pnpm
pnpm install --dev
```

Required development tools:
- Node.js 22+
- TypeScript compiler
- Native build tools (node-gyp)
- C++ compiler with N-API support

## Verification

After installation, verify the package works:

```bash
# Create a test file
echo 'import { info } from "node-syslog"; info("Installation test");' > test.js

# Run the test
node test.js
```

Check syslog for the test message:
```bash
# On most systems
tail -f /var/log/syslog

# Or on systemd systems
journalctl -f
```

## Troubleshooting

### Common Issues

#### 1. "Unsupported Platform" Error

**Problem:** Package doesn't support your OS/architecture
```bash
Error: Failed to load native syslog module. This package only supports Linux x64/ARM64.
```

**Solution:** Use a supported platform or consider alternative logging libraries.

#### 2. Native Module Compilation Failed

**Problem:** Source compilation fails during installation
```bash
Error: node-gyp failed to rebuild
```

**Solution:** Install required build tools:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install build-essential python3

# CentOS/RHEL
sudo yum groupinstall "Development Tools"
sudo yum install python3

# Fedora
sudo dnf groupinstall "Development Tools"
sudo dnf install python3
```

#### 3. Permission Denied

**Problem:** Cannot write to syslog
```bash
Error: Permission denied when writing to syslog
```

**Solution:** Check syslog configuration and permissions:
```bash
# Test syslog access
logger "Test message from $(whoami)"

# Check if your user can write to syslog
sudo usermod -a -G adm $USER  # Add to adm group
# Log out and log back in
```

#### 4. Missing Dependencies

**Problem:** Missing system dependencies
```bash
Error: Cannot find syslog.h
```

**Solution:** Install development headers:
```bash
# Ubuntu/Debian
sudo apt-get install libc6-dev

# CentOS/RHEL
sudo yum install glibc-devel

# Fedora
sudo dnf install glibc-devel
```

### Debug Mode

Enable debug logging for troubleshooting:

```bash
# Set debug environment variable
export DEBUG=node-syslog:*

# Run your application
node your-app.js
```

### Clean Installation

For a fresh installation:

```bash
# Remove existing installation
npm uninstall node-syslog

# Clear npm cache
npm cache clean --force

# Reinstall
npm install node-syslog
```

## Docker Installation

### Dockerfile Example

```dockerfile
FROM node:22-alpine

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc-dev

WORKDIR /app
COPY package*.json ./
RUN npm install node-syslog

COPY . .
RUN npm run build

CMD ["node", "your-app.js"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    volumes:
      - ./logs:/var/log
    environment:
      - NODE_ENV=production
```

## Next Steps

After successful installation:

1. Read the [API Reference]({{ site.baseurl }}/api/)
2. Check the [Examples](./examples.md)
3. Review the [Migration Guide](./migration.md) if upgrading from node-syslog v1

## Support

If you encounter issues not covered here:

- Check [GitHub Issues](https://github.com/yourusername/node-syslog/issues)
- Start a [Discussion](https://github.com/yourusername/node-syslog/discussions)
- Review [Troubleshooting Guide]({{ site.baseurl }}/docs/troubleshooting/)