# Change: Fix GitHub Pages base URL structure

## Why
The current GitHub Pages configuration needs to ensure all documentation pages are properly accessible under the `/node-syslog/` base URL path with a proper index page. The current structure may have issues with page accessibility and navigation.

## What Changes
- Ensure Jekyll baseurl configuration is correctly set to "/node-syslog"
- Verify GitHub Actions workflow uses correct baseurl parameter
- Ensure all pages are accessible under `/node-syslog/` path
- Ensure proper index page exists at `/node-syslog/`
- Fix any internal links and references to use correct URL structure

## Impact
- Affected specs: documentation-site
- Affected code: docs/_config.yml, .github/workflows/docs.yml, internal documentation links
- Ensures consistent URL structure for all documentation pages