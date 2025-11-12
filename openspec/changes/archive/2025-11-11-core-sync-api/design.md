## Context
This is the foundational implementation of a modern Node.js syslog library that replaces the abandoned `node-syslog` package. The implementation must provide a fluent TypeScript class API with synchronous methods only, leveraging N-API for stable binary compatibility across Node.js versions.

## Goals / Non-Goals
- Goals: Modern N-API implementation, fluent TypeScript API, synchronous only, Linux ARM64/AMD64 binaries
- Non-Goals: Async API, Windows/macOS support, legacy Node.js versions, remote logging, RFC5424 formatting

## Decisions
- Decision: Use N-API instead of native addons for ABI stability across Node.js 22+ versions
- Decision: Synchronous API only because syslog(3) is already non-blocking at kernel level
- Decision: Fluent class pattern for better TypeScript intellisense and method chaining
- Decision: node-pre-gyp for binary distribution to avoid compilation for end users
- Decision: Vitest with mocked native module for reliable testing without system dependencies

Alternatives considered:
- node-addon-api vs N-API: N-API chosen for maximum stability
- Async vs Sync API: Sync chosen because syslog(3) returns immediately (~50ns)
- Functional vs Class API: Class chosen for better TypeScript experience

## Risks / Trade-offs
- Platform limitation (Linux only) → Mitigation: Clear documentation and error messages
- Binary distribution complexity → Mitigation: node-pre-gyp with GitHub Actions automation
- Synchronous API perception → Mitigation: Documentation explaining syslog(3) is non-blocking

## Migration Plan
1. Implement native module with N-API bindings
2. Create TypeScript fluent class wrapper
3. Setup build and distribution pipeline
4. Add comprehensive test coverage
5. Deploy documentation and examples

Rollback: Keep old package available during transition period, provide migration guide

## Open Questions
- Should we include structured logging support in initial release?
- What level of systemd journal integration is needed beyond basic syslog?
- Should we provide a compatibility layer for the old node-syslog API?