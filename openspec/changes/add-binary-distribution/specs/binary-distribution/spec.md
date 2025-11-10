## ADDED Requirements
### Requirement: Multi-Version Binary Distribution
The system SHALL provide pre-built binaries for Node.js versions 22, 24, and 25 across ARM64 and AMD64 architectures.

#### Scenario: Successful binary installation
- **WHEN** user runs `pnpm install node-syslog` on supported Linux ARM64/AMD64
- **THEN** appropriate pre-built binary is downloaded automatically
- **AND** native module loads without compilation

#### Scenario: Unsupported Node.js version
- **WHEN** user runs installation on Node.js < 22
- **THEN** system falls back to source compilation
- **AND** user receives clear warning about unsupported version

### Requirement: Alternative Binary Hosting
The system SHALL host binaries on alternative platform (not GitHub Releases) with reliable download and integrity verification.

#### Scenario: Binary download with validation
- **WHEN** installation script downloads binary
- **THEN** SHA256 checksum is verified before extraction
- **AND** corrupted downloads trigger retry with fallback compilation

#### Scenario: Hosting service unavailability
- **WHEN** binary hosting service is unavailable
- **THEN** installation gracefully falls back to source compilation
- **AND** user is informed about the fallback mode

### Requirement: Installation Validation
The system SHALL provide validation script to verify binary integrity and native module functionality.

#### Scenario: Post-installation validation
- **WHEN** installation completes
- **THEN** validation script verifies native module loads correctly
- **AND** basic syslog functionality is tested
- **AND** validation results are reported to user

### Requirement: Migration Support
The system SHALL provide comprehensive migration guide for users upgrading from old node-syslog package.

#### Scenario: API migration
- **WHEN** user references migration guide
- **THEN** all breaking API changes are clearly documented
- **AND** code examples show before/after patterns
- **AND** common migration issues are addressed with solutions