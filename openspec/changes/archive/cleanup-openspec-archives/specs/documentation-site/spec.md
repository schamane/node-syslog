## MODIFIED Requirements
### Requirement: GitHub Pages Deployment
The system SHALL automatically deploy documentation to GitHub Pages via GitHub Actions workflow with correct base URL configuration and maintain organized archive of past changes.

#### Scenario: Automated deployment
- **WHEN** changes are pushed to the main branch
- **THEN** the system SHALL trigger documentation build and deployment
- **AND** publish updated site to gh-pages branch
- **AND** use correct base URL `/node-syslog` for proper URL structure

#### Scenario: Documentation accessibility
- **WHEN** documentation is deployed to GitHub Pages
- **THEN** the system SHALL be accessible at `https://schamane.github.io/node-syslog/`
- **AND** provide stable URLs for all documentation sections
- **AND** ensure all internal links work correctly with base URL prefix

#### Scenario: Base URL configuration
- **WHEN** Jekyll configuration is set up
- **THEN** the system SHALL use `baseurl: "/node-syslog"` in _config.yml
- **AND** pass `--baseurl="/node-syslog"` to Jekyll build command
- **AND** generate correct URL structure for all pages and assets

#### Scenario: Archive organization
- **WHEN** OpenSpec changes are archived
- **THEN** the system SHALL maintain clean, non-duplicate archive structure
- **AND** provide documentation for archived changes
- **AND** ensure archive navigation is clear and maintainable