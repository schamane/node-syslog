# Project Context

## Purpose
Create a minimal, modern TypeScript-native Node.js extension that provides direct Linux kernel syslog logging. Replaces the deprecated `node-syslog` package with N-API pre-built binaries for ARM64/AMD64, offering a fluent class-based synchronous API exclusively. Documentation hosted on GitHub Pages with rendered Markdown for key topics.

### Key Goals
- Replace abandoned `node-syslog` with modern N-API implementation
- Support Linux ARM64 & AMD64 only via pre-built binaries
- Target Node.js 22+ LTS and higher versions only (no legacy support)
- 100% TypeScript source with strict mode and generated declarations
- Zero runtime dependencies, < 50KB binary size
- Fluent class API (Option A) - synchronous only
- Documentation on GitHub Pages with rendered Markdown
- Follow OpenSpec for AI-driven development with minimal overhead
- No async API (syslog(3) is already non-blocking at kernel level)

## Tech Stack

### Core Technologies
- **Runtime**: Node.js >= 22.x LTS (current and future versions only)
- **Native Extension**: N-API (stable ABI)
- **System Interface**: Direct `syslog(3)` libc calls (C)
- **Build System**: node-pre-gyp for binary distribution
- **TypeScript**: Strict mode, compiled to JS with `.d.ts` declarations
- **Package Manager**: pnpm for development, npm for publishing/distribution
- **Documentation**: GitHub Pages with Jekyll and just-the-docs theme
- **AI Framework**: OpenSpec specification-driven development

### Development Tools
- **Languages**: C (native), TypeScript (bindings), JavaScript (compiled)
- **Testing**: Vitest for TS layer only (mock native module)
- **CI/CD**: GitHub Actions cross-compiling ARM64/AMD64 binaries
- **Package Management**: pnpm (development), npm (user distribution)
- **Documentation**: Markdown files in `docs/` rendered by Jekyll

### Documentation Architecture

#### GitHub Pages Setup
- **Branch**: `gh-pages` for documentation deployment
- **Theme**: just-the-docs Jekyll theme (clean, searchable, mobile-friendly)
- **Source**: Markdown files in `/docs` directory on `main` branch
- **Auto-deployment**: GitHub Action builds and deploys on push to `main`
- **URL**: `https://schamane.github.io/node-syslog/`

#### Documentation Structure
```
docs/
├── index.md              # Landing page with quick start
├── getting-started.md    # Installation & first steps
├── installation.md       # Detailed installation instructions
├── api.md               # Complete API documentation
├── examples.md          # Usage examples and patterns
└── migration.md         # Migration from old node-syslog
```

### Architecture Patterns

#### Native Module Architecture
```
┌─────────────────────────────────────────────┐
│  TypeScript API Layer (src/index.ts)        │
│  Fluent class, input validation, types      │
├─────────────────────────────────────────────┤
│  N-API C++ Bridge (src/binding.cpp)         │
│  Direct type conversion, no threadpool      │
├─────────────────────────────────────────────┤
│  C Implementation (src/syslog.c)            │
│  Direct syslog(3) calls, zero allocations   │
└─────────────────────────────────────────────┘
```

#### API Strategy: Option A (Fluent Class)
```typescript
import { Syslog } from 'node-syslog'

const logger = new Syslog({
  ident: 'myapp',
  facility: 'local0',
  options: ['pid', 'odelay']
})

// Synchronous API only - syslog(3) is non-blocking
logger.info('Server started', { port: 3000 })
logger.error('Connection failed', { code: 'ECONNREFUSED' })
logger.close()
```

#### Synchronous Design Rationale
- `syslog(3)` is already async at kernel level (returns immediately after queuing)
- Direct syscall latency: ~50 nanoseconds (negligible event loop impact)
- No threadpool overhead = simplest implementation
- N-API wrapper adds only ~500ns per call
- Supports > 500,000 messages/second without blocking
- Eliminates Promises, callbacks, and complexity for users

#### Distribution Strategy
- Pre-built binaries: `linux-arm64`, `linux-amd64` on GitHub Releases
- node-pre-gyp downloads correct binary on `npm install`
- Fallback: Compile from source if platform unsupported
- N-API ABI ensures one binary works across all Node.js 22+ versions

### Code Style
- **C Code**: Linux kernel style (tabs, 8-char indent, 100 col limit)
  - Function prefix: `syslog_napi_`
  - Error handling: Return negative errno values
- **TypeScript**: Strict mode, 2-space indent, explicit return types
  - Classes: `PascalCase`
  - Methods: `camelCase`
  - Interfaces: `ISyslogOptions`, `LogLevel`, etc.
  - Constants: `UPPER_SNAKE_CASE`
  - **No Enums**: Use `as const` objects with derived union types
    ```typescript
    // ❌ PROHIBITED:
    enum Status { Active = 'active', Inactive = 'inactive' }
    
    // ✅ REQUIRED:
    const Status = {
      Active: 'active',
      Inactive: 'inactive'
    } as const;
    
    type StatusType = typeof Status[keyof typeof Status];
    ```
- **Documentation**: TSDoc for all public APIs, minimal C comments

### Testing Strategy

#### Vitest (TypeScript Layer Only)
- **Unit Tests**: Mock native module (`binding.node`)
- **Input Validation**: Test facility names, log levels, options
- **Error Handling**: Test invalid arguments, system errors
- **Type Safety**: Verify TypeScript types with `expectType`
- **Coverage**: > 95% statement coverage

**Example Vitest Test:**
```typescript
import { describe, it, expect, vi } from 'vitest'
import { Syslog } from '../src/index'

vi.mock('../binding.node', () => ({
  init: vi.fn(),
  log: vi.fn(),
  close: vi.fn()
}))

describe('Syslog', () => {
  it('rejects invalid facility', () => {
    expect(() => new Syslog({ facility: 'invalid' as any }))
      .toThrow('Invalid facility: invalid')
  })
})
```

### Documentation Generation Strategy

#### Automated API Docs
- Use `typedoc` to generate API documentation from TSDoc comments
- Output Markdown files to `docs/api/` directory
- Integrate with just-the-docs navigation structure
- Update on every release via GitHub Action

#### Manual Documentation
- Hand-written Markdown in `docs/` for guides and examples
- Include diagrams (Mermaid) for architecture explanations
- Code examples tested via CI to ensure they work

### Git Workflow
- **Branching**: GitFlow
  - `main`: Production releases
  - `develop`: Integration branch
  - `feature/name`: New features (OpenSpec proposal required)
  - `hotfix/name`: Critical fixes
  - `gh-pages`: Auto-generated documentation site
- **Development**: Use pnpm commands
  - `pnpm install` instead of `npm install`
  - `pnpm test` instead of `npm test`
  - `pnpm run build` instead of `npm run build`
- **Publishing**: Use npm for distribution (users expect npm install)
- **Commits**: Conventional commits
  - `feat: add structured logging`
  - `fix: correct facility bit mask`
  - `docs: update installation guide`
- **PRs**: Require OpenSpec proposal + Vitest coverage
- **Releases**: Automated via GitHub Actions
  - `npm version patch/minor/major`
  - Builds & uploads ARM64/AMD64 binaries
  - Creates GitHub release with changelog
  - Deploys updated docs to GitHub Pages

## Domain Context

### Linux Syslog System
- **Interface**: `syslog(3)` from `<syslog.h>`
- **Connection**: `/dev/log` Unix domain socket (systemd journal integration)
- **Facilities**: 16 standard (USER, LOCAL0-7, DAEMON, KERNEL, etc.)
- **Levels**: 8 severity levels (EMERG → DEBUG)
- **Daemon**: rsyslog (default) or syslog-ng (optional)
- **Behavior**: Kernel receives immediately, libc handles queuing

### Key Technical Insights
- `syslog(3)` is non-blocking (returns immediately after queuing)
- Thread-safe and async-signal-safe
- No dynamic memory allocation in hot path (libc static buffer)
- N-API provides stable ABI across Node.js versions
- Message size limit: 1KB (enforced by libc)

### Performance Characteristics
- **Raw syslog(3)**: ~50ns per call
- **N-API wrapper**: ~500ns per call (10x overhead, still negligible)
- **Throughput**: > 500,000 messages/second
- **Event Loop Impact**: < 0.01% at 10,000 logs/second
- **Memory**: Zero allocations in log path

## Important Constraints

### Technical Constraints
- **Platform**: Linux only (kernel 3.10+, glibc 2.17+/musl 1.1.20+)
- **Architectures**: ARM64, AMD64 pre-built binaries only
- **Node.js**: >= 22.x LTS (current and future versions)
- **Zero Dependencies**: No npm packages in `dependencies`
- **Binary Size**: < 50KB per architecture

### Performance Constraints
- **Latency**: < 1μs overhead vs raw `syslog(3)`
- **Throughput**: > 100,000 messages/second without blocking
- **Memory**: Zero allocations in log hot path
- **Startup**: < 5ms module load time

### API Constraints
- **Fluent Class**: Option A pattern exclusively (no functional API)
- **Synchronous Only**: No async methods, no Promises
- **Type Safety**: Full TypeScript strict mode compliance
- **Simplicity**: No RFC5424, no remote logging, no buffering
- **Local Kernel**: Direct kernel logging only

### Security Constraints
- **Input Validation**: Prevent format string injection
- **Buffer Safety**: Use `snprintf` with explicit bounds
- **Max Length**: Enforce 1KB message limit
- **Thread Safety**: Safe across Node.js worker threads
- **No Privileges**: Works as unprivileged user

### Development Constraints
- **OpenSpec-First**: Every feature starts with proposal
- **AI-Assisted**: Implementation follows OpenSpec tasks
- **Documentation**: TSDoc examples for every method + GitHub Pages
- **Native Safety**: Pass Valgrind/ASAN/ThreadSanitizer
- **Package Management**: pnpm for development, npm for distribution

## AI Agent Development Guidelines

### Containerization Best Practices
The system SHALL prioritize containerization for native binary builds using Chainguard Wolfi OS containers with the following hierarchy:

#### Requirement: Container Base Image Mandate
When building container images for node-syslog, AI Agents SHALL use Chainguard containers exclusively:

**WHEN** building container images for node-syslog  
**THEN** system SHALL use cgr.dev/chainguard/node images exclusively  
**AND** use -dev variant for build stages (builder image)  
**AND** use non-dev variant for runtime stages (distroless)  
**AND** leverage Wolfi OS package management (apk)  
**AND** follow Chainguard security best practices

**WHEN** selecting base image tags  
**THEN** system SHALL use latest stable tags  
**AND** avoid version pinning without security review  
**AND** utilize multi-stage builds for optimization

#### Requirement: Container Tool Preference Hierarchy
When building native binaries, AI Agents SHALL follow this container tool preference:

**WHEN** native binary compilation is required  
**THEN** system SHALL attempt Podman first, then Docker as fallback  
**AND** provide rootless container support when available  
**AND** ensure container environment consistency across all build stages

**WHEN** container runtime selection is needed  
**THEN** system SHALL detect available container runtimes  
**AND** prefer Podman if available and functional  
**AND** fall back to Docker if Podman unavailable  
**AND** log runtime selection for debugging purposes

#### Requirement: Containerized Build Support
The build system SHALL support containerized builds using Chainguard Wolfi OS for environment consistency and security.

#### Scenario: Multi-stage Chainguard Build Architecture
When building in containerized environment:
- **THEN** system SHALL use Chainguard dev image for build stage
- **AND** use Chainguard runtime image for final stage
- **AND** copy only compiled artifacts to runtime stage
- **AND** ensure build tools excluded from production image
- **AND** support both Docker and Podman runtimes

#### Scenario: Native Module Compilation with Wolfi
When compiling native C++ modules:
- **THEN** system SHALL use Wolfi OS build toolchain
- **AND** provide all necessary build dependencies via apk
- **AND** support node-gyp compilation in Chainguard environment
- **AND** ensure N-API compatibility across Node.js versions

### GitHub Actions and Debugging Guidelines
The system SHALL use GitHub Actions workflows with proper debugging and tracing support:

#### Requirement: GitHub Token Usage for Remote Debugging
WHEN debugging documentation generation or GitHub Actions pipelines  
THEN system SHALL use GH_TOKEN from @.env file for remote access  
AND enable detailed logging and tracing in GitHub Actions  
AND provide step-by-step debugging information in workflow outputs  
AND ensure proper secret management and security practices

#### Requirement: Documentation Build Debugging
WHEN troubleshooting documentation generation issues  
THEN system SHALL enable verbose logging in documentation build process  
AND capture build artifacts for analysis  
AND provide clear error messages with actionable steps  
AND maintain build environment isolation for reproducible debugging

### GitHub Actions Pipeline Design
The system SHALL follow minimalistic, job-based GitHub Actions pipeline design:

#### Requirement: Job-Based Pipeline Architecture
WHEN designing GitHub Actions workflows  
THEN system SHALL organize pipelines by logical job groups  
AND create separate jobs for distinct concerns (build, test, deploy)  
AND avoid shell script generation when possible  
AND use GitHub Actions marketplace actions for common tasks  
AND ensure job dependencies are clearly defined

#### Requirement: Binary Artifact Management
WHEN workflows need to share native binaries  
THEN system SHALL use GitHub Actions artifacts for binary transfer  
AND ensure artifact naming includes platform and version information  
AND validate artifact integrity before use in subsequent jobs  
AND provide artifact cleanup mechanisms to prevent storage bloat

### Documentation System Guidelines
The system SHALL follow documentation generation best practices:

#### Requirement: Jekyll Standalone Build
WHEN building documentation  
THEN system SHALL treat Jekyll as standalone documentation builder  
AND use just-the-docs theme for professional presentation  
AND build complete documentation site without GitHub Pages defaults  
AND deploy to gh-pages branch via special workflow

#### Requirement: Self-Contained Documentation
WHEN generating documentation  
THEN system SHALL build entire documentation site from source  
AND avoid GitHub Pages automatic processing  
AND use custom Jekyll configuration with theme  
AND ensure all assets are properly included in build output

### Node.js Native Module Best Practices
The system SHALL follow established patterns from well-known Node.js native modules:

#### Requirement: Best Practice Compliance
WHEN implementing native module features  
THEN system SHALL reference similar established Node.js native modules  
AND follow their patterns for error handling, memory management, and API design  
AND ensure compatibility with Node.js N-API standards  
AND validate against common native module testing patterns

#### Requirement: Cross-Platform Considerations
WHEN designing native module interfaces  
THEN system SHALL consider platform-specific requirements  
AND provide clear error messages for unsupported platforms  
AND ensure graceful degradation when features are unavailable  
AND document platform-specific behavior and limitations

## External Dependencies

### System Dependencies (Runtime)
- **Linux**: Kernel 3.10+
- **libc**: glibc 2.17+ or musl 1.1.20+
- **Node.js**: 22.x LTS and higher
- **syslog daemon**: rsyslog or syslog-ng (optional)

### Build Dependencies (N-API Related Only)
- **node-gyp**: ^10.0.0 (npm built-in, explicit for development)
- **C Compiler**: GCC 7+ or Clang 6+ (node-gyp requirement)
- **Python**: 3.8+ (node-gyp requirement)
- **Make**: GNU Make 3.8+ (node-gyp requirement)

### No Runtime npm Dependencies
- Pure native module + compiled TypeScript
- Zero packages in `dependencies` field

### Development Dependencies (pnpm)
```json
{
  "devDependencies": {
    "typescript": "^5.3.0",
    "vitest": "^1.0.0",
    "typedoc": "^0.25.0",
    "node-gyp": "^10.0.0"
  }
}

## Completed Features

### ✅ Remove TypeScript Enums (November 2025)
**Status**: COMPLETED  
**OpenSpec**: `remove-typescript-enums`  
**Implementation**: 12/12 phases completed

**Changes Made**:
- Replaced `SyslogFacility`, `SyslogLevel`, `SyslogOption` enums with `as const` objects
- Created derived union types: `SyslogFacilityType`, `SyslogLevelType`, `SyslogOptionType`
- Updated all documentation, tests, and examples to use new const objects
- Maintained full backward compatibility with `LOG_` prefixed property names
- Achieved zero runtime overhead and better type safety

**Benefits**:
- Eliminated enum runtime overhead
- Improved bundle size optimization
- Enhanced type safety with union types
- Followed modern TypeScript best practices
- Maintained full IDE support and autocomplete

**Validation**:
- ✅ All 20 tests passing (83.16% coverage)
- ✅ TypeScript compilation with strict mode
- ✅ ESLint validation (zero errors)
- ✅ Documentation generation and validation
- ✅ Build process successful
