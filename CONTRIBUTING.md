# Contributing to node-syslog

Thank you for your interest in contributing to node-syslog! This document provides guidelines and information for contributors.

## Development Setup

### Prerequisites

- **Node.js** 22.x LTS or higher
- **Linux** operating system (ARM64 or AMD64)
- **C++ compiler** and development tools
- **Git** for version control

### Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/node-syslog.git
   cd node-syslog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   npm run build:native
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Follow the existing code style and conventions
- Add tests for new functionality
- Update documentation as needed
- Ensure all tests pass

### 3. Test Your Changes

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Lint code
npm run lint

# Build documentation
npm run docs:build
```

### 4. Commit Your Changes

Use [conventional commits](https://www.conventionalcommits.org/) format:

```bash
git commit -m "feat: add structured logging support"
git commit -m "fix: resolve memory leak in native module"
git commit -m "docs: update installation guide"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request against the `main` branch.

## Code Style

### TypeScript

- Use **2 spaces** for indentation
- Use **explicit return types**
- Follow **PascalCase** for classes and interfaces
- Use **camelCase** for methods and variables
- Use **UPPER_SNAKE_CASE** for constants

```typescript
// Good
export class Syslog {
  private readonly ident: string
  
  constructor(options: SyslogOptions) {
    this.ident = options.ident
  }
  
  public log(message: string): void {
    // Implementation
  }
}

// Bad
export class syslog {
  private ident
  
  constructor(options) {
    this.ident = options.ident
  }
  
  public Log(message) {
    // Implementation
  }
}
```

### C++ Code

- Use **Linux kernel style** (tabs, 8-char indent, 100 col limit)
- Function prefix: `syslog_napi_`
- Error handling: Return negative errno values

```cpp
// Good
int syslog_napi_init(napi_env env, napi_callback_info info) {
    napi_status status;
    size_t argc = 2;
    napi_value args[2];
    
    status = napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);
    if (status != napi_ok) {
        napi_throw_error(env, nullptr, "Failed to get arguments");
        return -1;
    }
    
    return 0;
}

// Bad
int init(napi_env env, napi_callback_info info) {
    // Missing error handling
    // Wrong indentation
    return 0;
}
```

## Testing

### Unit Tests

- Use **Vitest** for testing
- Mock native module for TypeScript layer tests
- Aim for **>95%** code coverage
- Test both success and error cases

```typescript
import { describe, it, expect, vi } from 'vitest'
import { Syslog } from '../src/index'

describe('Syslog', () => {
  it('should create logger with valid options', () => {
    const logger = new Syslog({
      ident: 'test',
      facility: 'local0'
    })
    
    expect(logger).toBeDefined()
  })
  
  it('should throw error with invalid facility', () => {
    expect(() => new Syslog({
      ident: 'test',
      facility: 'invalid' as any
    })).toThrow('Invalid facility: invalid')
  })
})
```

### Native Module Testing

- Test with different Node.js versions
- Test on both ARM64 and AMD64 architectures
- Verify memory management
- Test error handling

## Documentation

### API Documentation

- Use **TSDoc** comments for all public APIs
- Include parameter descriptions and return types
- Provide usage examples

```typescript
/**
 * Creates a new syslog instance with the specified options.
 * 
 * @param options - Configuration options for the syslog instance
 * @param options.ident - Identifier for log messages (required)
 * @param options.facility - Syslog facility (default: 'user')
 * @param options.options - Syslog options (default: [])
 * 
 * @example
 * ```typescript
 * const logger = new Syslog({
 *   ident: 'myapp',
 *   facility: 'local0',
 *   options: ['pid', 'ndelay']
 * })
 * ```
 */
export class Syslog {
  constructor(options: SyslogOptions) {
    // Implementation
  }
}
```

### User Documentation

- Update **getting-started.md** for new features
- Add examples to **examples.md**
- Update **migration.md** for breaking changes
- Keep documentation in sync with code

## OpenSpec Process

This project uses **OpenSpec** for specification-driven development:

### For New Features

1. **Create a proposal**
   ```bash
   # Follow OpenSpec guidelines in openspec/AGENTS.md
   # Create proposal.md, tasks.md, and spec deltas
   ```

2. **Get approval**
   - Submit proposal for review
   - Wait for approval before implementation

3. **Implement**
   - Follow tasks.md checklist
   - Update task status as you progress
   - Mark all tasks complete when done

4. **Archive**
   - Use `openspec archive <change-id>` after deployment
   - Update specs if capabilities changed

### For Bug Fixes

- Bug fixes that restore intended behavior don't need OpenSpec proposals
- Implement fix directly with tests
- Follow normal PR process

## Pull Request Guidelines

### Before Submitting

- [ ] All tests pass (`npm test`)
- [ ] Code coverage >95% (`npm run test:coverage`)
- [ ] No linting errors (`npm run lint`)
- [ ] Documentation updated
- [ ] OpenSpec tasks completed (if applicable)
- [ ] Commits follow conventional format

### PR Description Template

```markdown
## Description
Brief description of changes and motivation.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing performed
- [ ] Cross-platform testing (ARM64/AMD64)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests pass
- [ ] OpenSpec tasks completed (if applicable)
```

## Release Process

Releases are automated through GitHub Actions:

1. **Version bump**
   ```bash
   npm version patch  # or minor, major
   ```

2. **Automatic release**
   - Builds and uploads ARM64/AMD64 binaries
   - Creates GitHub release with changelog
   - Publishes to npm
   - Deploys updated documentation

## Getting Help

- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Report bugs or request features
- **Documentation**: Check existing docs first
- **OpenSpec**: Review `openspec/AGENTS.md` for process questions

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

### Our Pledge

- Be inclusive and welcoming
- Be respectful of different viewpoints
- Focus on what is best for the community
- Show empathy toward other community members

### Reporting Issues

If you experience or witness unacceptable behavior, please contact the project maintainers privately.

Thank you for contributing to node-syslog! 🎉