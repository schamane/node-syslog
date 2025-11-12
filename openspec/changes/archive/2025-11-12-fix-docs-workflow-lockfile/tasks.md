## 1. Update GitHub Actions Workflow for pnpm
- [x] 1.1 Add pnpm/action-setup step before Node.js setup
- [x] 1.2 Replace actions/setup-node cache configuration for pnpm
- [x] 1.3 Change `npm ci` to `pnpm install --frozen-lockfile`
- [x] 1.4 Update all npm script calls to use pnpm equivalents

## 2. Add Native Module Compilation
- [x] 2.1 Add native build tools installation step
- [x] 2.2 Add `pnpm run build:native` before TypeScript build
- [x] 2.3 Setup Linux build environment for native compilation
- [x] 2.4 Ensure native module loads correctly for TypeDoc

## 3. Generate and Add Lockfile
- [x] 3.1 Generate pnpm-lock.yaml with `pnpm install`
- [x] 3.2 Add pnpm-lock.yaml to repository
- [x] 3.3 Verify lockfile includes all development dependencies
- [x] 3.4 Test lockfile works with frozen-lockfile flag

## 4. Fix Documentation Build Dependencies
- [x] 4.1 Ensure TypeScript build runs before docs:build
- [x] 4.2 Verify native module is available for API generation
- [x] 4.3 Test complete documentation build pipeline
- [x] 4.4 Validate Jekyll site builds with generated API docs

## 5. Validate Workflow
- [x] 5.1 Test workflow runs successfully on pull request
- [x] 5.2 Verify documentation builds and deploys to GitHub Pages
- [x] 5.3 Confirm native module compilation works in CI
- [x] 5.4 Test caching works properly with pnpm