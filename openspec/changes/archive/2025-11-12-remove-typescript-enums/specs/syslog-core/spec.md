## MODIFIED Requirements

### Requirement: Facility and Level Validation
The system SHALL validate facility names and log levels with TypeScript intellisense support using modern const objects with derived union types.

#### Scenario: Valid facility names with const objects
- **WHEN** accessing facility options via TypeScript
- **THEN** system SHALL provide autocomplete for all 16 standard facilities
- **AND** use const object property access syntax (SyslogFacility.LOG_USER)
- **AND** provide derived union type for compile-time type checking
- **INCLUDING** user, local0-7, daemon, mail, auth, etc.

#### Scenario: Valid log levels with const objects
- **WHEN** an invalid log level is provided
- **THEN** system SHALL throw a TypeError
- **AND** list valid level options using const object properties
- **AND** maintain derived union type for compile-time validation

#### Scenario: Modern TypeScript patterns
- **WHEN** TypeScript code is compiled
- **THEN** system SHALL use const objects instead of enums
- **AND** provide zero runtime overhead for constant access
- **AND** maintain identical numeric values to previous enum implementation