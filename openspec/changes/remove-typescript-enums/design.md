## Context
TypeScript team has published "Farewell to Enums" guidance, recommending against enum usage due to non-standard runtime behavior, bundle bloat, and compatibility issues with future ECMAScript proposals. Modern TypeScript best practices favor `as const` objects with derived union types.

## Goals / Non-Goals
- Goals: Eliminate enum runtime overhead, improve bundle size, align with modern TypeScript standards
- Non-Goals: Change API behavior, break existing functionality, alter type safety guarantees

## Decisions
- Decision: Replace all enum declarations with `as const` objects and derived union types
- Decision: Maintain identical runtime behavior while eliminating enum overhead
- Decision: Use pattern: `const Name = { ... } as const; type NameType = typeof Name[keyof typeof Name];`
- Alternatives considered: Keep enums (rejected for bundle bloat), use string literals only (rejected for type safety)

## Risks / Trade-offs
- Breaking change for consumers using enum syntax → Mitigation: Provide clear migration guide and maintain type compatibility
- Learning curve for new pattern → Mitigation: Comprehensive documentation and examples
- Potential tooling compatibility issues → Mitigation: Thorough testing with build tools

## Migration Plan
1. Replace enum declarations with const objects in src/types/index.ts
2. Update all code references to use const object properties
3. Update type annotations to use derived union types
4. Update tests and documentation
5. Validate compilation and runtime behavior

## Open Questions
- Impact on existing consumer code and migration path
- Tooling compatibility with new type patterns
- Performance impact on compilation times