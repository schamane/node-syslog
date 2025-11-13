## 1. Corepack Integration
- [x] 1.1 Replace npm install -g pnpm with corepack enable pnpm
- [x] 1.2 Test corepack functionality in Chainguard image
- [x] 1.3 Verify pnpm works after corepack enable
- [x] 1.4 Remove root permissions requirement for package management

## 2. Direct Vitest Execution
- [x] 2.1 Update CMD to use ./node_modules/.bin/vitest run
- [x] 2.2 Test vitest execution without pnpm wrapper
- [x] 2.3 Verify test results match current behavior
- [x] 2.4 Test coverage and watch modes

## 3. Package.json Simplification
- [x] 3.1 Update test scripts to use vitest directly
- [x] 3.2 Update test:coverage to use vitest --coverage
- [x] 3.3 Update test:watch to use vitest (watch mode)
- [x] 3.4 Remove container-test.js dependency

## 4. Dockerfile Cleanup
- [x] 4.1 Remove multiple USER switches
- [x] 4.2 Simplify build stages
- [x] 4.3 Remove complex test runner setup
- [x] 4.4 Optimize layer caching

## 5. Validation
- [x] 5.1 Test build performance improvement
- [x] 5.2 Verify image size maintained or reduced
- [x] 5.3 Test all test scenarios (run, coverage, watch)
- [x] 5.4 Validate security improvements
