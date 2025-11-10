# Change: Core Fluent Sync API

## Why
Replace the abandoned `node-syslog` package with a modern N-API implementation that provides a fluent TypeScript class-based synchronous API for Linux kernel syslog logging.

## What Changes
- Implement C native module with N-API for direct syslog(3) integration
- Create TypeScript `Syslog` class with fluent synchronous methods
- Add facility and level validation with TypeScript intellisense
- Setup Vitest testing framework with mocked native module
- Configure node-pre-gyp for binary distribution (ARM64/AMD64)
- Setup pnpm workspace and lockfile for development

## Impact
- Affected specs: `syslog-core` (new capability)
- Affected code: New native module, TypeScript bindings, build system
- **BREAKING**: New API replaces old node-syslog package completely