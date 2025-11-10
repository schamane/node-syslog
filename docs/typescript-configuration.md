# TypeScript Configuration

This project uses a comprehensive triple-base TypeScript configuration to provide optimal development experience, modern Node.js LTS support, and latest TypeScript features.

## Base Configuration Stack

The `tsconfig.json` extends from three community-maintained base configurations:

### 1. @tsconfig/recommended
- **Purpose**: TypeScript team recommended best practices
- **Provides**: Foundation settings with strict mode enabled
- **Version**: ^1.0.11

### 2. @tsconfig/node22  
- **Purpose**: Node.js 22 LTS optimized settings
- **Provides**: Modern module resolution and ES2024 libraries
- **Version**: ^22.0.2

### 3. @tsconfig/node-ts
- **Purpose**: TypeScript 5.8+ specific features
- **Provides**: Latest TypeScript language features
- **Version**: ^23.6.1
- **Requirement**: TypeScript 5.8+ (satisfied by 5.9.3)

## Configuration Inheritance

The configurations are applied in this order (later configs override earlier ones):

1. **@tsconfig/recommended** (foundation)
2. **@tsconfig/node22** (Node.js LTS overrides)  
3. **@tsconfig/node-ts** (TypeScript 5.8+ features)
4. **Project overrides** (final layer)

## Key Features Enabled

### Module System
- **`nodenext`**: Modern ES modules with Node.js compatibility
- **`verbatimModuleSyntax`**: Strict import/export syntax checking
- **`rewriteRelativeImportExtensions`**: Automatically adds `.js` extensions to imports

### Type Checking
- **Enhanced strictness** from all three base configs
- **Community best practices** enforced
- **Future-proof settings** for TypeScript evolution

### Build Output
- **ES2022 target** for modern JavaScript features
- **ES2024 + ESNext libraries** for latest APIs
- **Source maps** and **declaration files** for debugging

## Development Guidelines

### Import Syntax
Due to `verbatimModuleSyntax` and `nodenext`:

```typescript
// ✅ Correct - explicit file extensions
import { Syslog } from './syslog.js';

// ✅ Correct - type-only imports
import type { SyslogOptions } from './types/index.js';

// ❌ Incorrect - missing extensions
import { Syslog } from './syslog';
```

### TypeScript Version
- **Current**: TypeScript 5.9.3
- **Minimum**: TypeScript 5.8+ (required for @tsconfig/node-ts)
- **Policy**: No automatic downgrades, version explicitly maintained

### Common Migration Issues

#### 1. Missing File Extensions
**Error**: `Relative import paths need explicit file extensions`
**Solution**: Add `.js` extensions to all relative imports

#### 2. Type-Only Imports
**Error**: `'X' is a type and must be imported using a type-only import`
**Solution**: Use `import type` for type-only imports

#### 3. Module Resolution
**Error**: `Cannot find module 'X' or its corresponding type declarations`
**Solution**: Ensure proper extension usage and module resolution

## Benefits

1. **Community Standards**: Follows TypeScript team recommendations
2. **Node.js LTS Ready**: Optimized for current Node.js versions
3. **Future-Proof**: Automatic updates with base config improvements
4. **Enhanced Type Safety**: Stricter checking from multiple sources
5. **Modern Module System**: ESM with proper extension handling

## Maintenance

- Base configurations are automatically updated via npm
- Project-specific overrides are preserved in local tsconfig.json
- TypeScript version is explicitly maintained at 5.9.3
- Configuration inheritance verified with `tsc --showConfig`