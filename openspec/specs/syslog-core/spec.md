# syslog-core Specification

## Purpose

The syslog core provides a comprehensive TypeScript wrapper around native syslog functionality, offering synchronous logging methods, facility and level validation, and proper resource management for system logging integration.
## Requirements
### Requirement: Syslog Class Initialization
The system SHALL provide a `Syslog` class that can be instantiated with configuration options for ident, facility, and syslog options.

#### Scenario: Successful initialization
- **WHEN** a new `Syslog` instance is created with valid options
- **THEN** the system SHALL initialize the underlying syslog connection
- **AND** return a configured logger instance

#### Scenario: Invalid facility error
- **WHEN** a `Syslog` instance is created with an invalid facility
- **THEN** the system SHALL throw a descriptive error
- **AND** list valid facility options

### Requirement: Synchronous Logging Methods
The system SHALL provide synchronous logging methods for all standard syslog levels (emergency, alert, critical, error, warning, notice, info, debug).

#### Scenario: Basic info logging
- **WHEN** the `info()` method is called with a message string
- **THEN** the system SHALL write the message to syslog with LOG_INFO level
- **AND** return immediately without blocking

#### Scenario: Error logging with context
- **WHEN** the `error()` method is called with a message and optional context object
- **THEN** the system SHALL format the message with context
- **AND** write to syslog with LOG_ERR level

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

### Requirement: Native Module Integration
The system SHALL provide N-API bindings for direct syslog(3) system calls.

#### Scenario: Native module loading
- **WHEN** the module is imported on a supported Linux system
- **THEN** the system SHALL load the precompiled native binary
- **AND** fallback to source compilation if binary unavailable

#### Scenario: Platform compatibility
- **WHEN** the module is imported on an unsupported platform
- **THEN** the system SHALL throw a clear error message
- **AND** list supported platforms (Linux ARM64/AMD64)

### Requirement: Resource Cleanup
The system SHALL provide proper cleanup of syslog resources.

#### Scenario: Explicit cleanup
- **WHEN** the `close()` method is called
- **THEN** the system SHALL call `closelog()`
- **AND** release any allocated resources

#### Scenario: Process exit cleanup
- **WHEN** the Node.js process exits
- **THEN** the system SHALL automatically cleanup syslog resources
- **AND** prevent resource leaks

