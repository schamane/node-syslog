# Change: Remove TypeScript Enums in Favor of as const Objects

## Why
TypeScript team no longer recommends enums as they introduce non-standard runtime behavior, bundle bloat, and compatibility issues with future ECMAScript proposals. Modern TypeScript best practices favor `as const` objects with derived union types.

## What Changes
- Replace all `enum` declarations with `as const` objects and derive union types
- Update type definitions to use new const object pattern
- Modify code that references enum values to use const object properties
- Update documentation and examples to reflect new pattern

## Impact
- Affected specs: typescript-api
- Affected code: src/types/index.ts, src/syslog.ts, src/index.ts, test files
- **BREAKING**: Changes enum usage pattern but maintains type safety and runtime behavior