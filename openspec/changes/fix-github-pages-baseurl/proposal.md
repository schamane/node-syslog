# Change: Fix GitHub Pages Base URL Configuration

## Why
The documentation site base URL configuration was inconsistent with the OpenSpec requirements. The original `update-github-pages-baseurl` change specified `/node-syslog` as the base URL, but the implementation used an empty string, causing a mismatch between the expected GitHub Pages URL structure and the actual deployment.

## What Changes
- Update `docs/_config.yml` to set `baseurl: "/node-syslog"` instead of empty string
- Modify GitHub Actions workflow to use `--baseurl="/node-syslog"` in Jekyll build command
- Archive the incomplete `update-github-pages-baseurl` change with proper implementation
- Ensure all internal links work correctly with the new base URL structure

## Impact
- Affected specs: `documentation-site`
- Affected code: `docs/_config.yml`, `.github/workflows/docs.yml`
- **BREAKING**: Changes GitHub Pages URL structure from root to `/node-syslog/` subdirectory
- Documentation will now be accessible at `https://schamane.github.io/node-syslog/`
- All internal links and navigation will work correctly with the new base URL