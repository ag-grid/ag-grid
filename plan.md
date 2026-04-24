## Verification Cycle
*   Run `nx clean` and `nx reset` for each testing cycle
*   Run `nx test`
*   Run `nx test:e2e`
*   Run `NODE_ENV=production yarn nx pack:verify --prod`
*   Run `nx dev` and verify that a grid is rendered for each of the following pages:
  *   https://localhost:4610/javascript-data-grid/getting-started/
  *   https://localhost:4610/angular-data-grid/getting-started/
  *   https://localhost:4610/react-data-grid/getting-started/
  *   https://localhost:4610/vue-data-grid/getting-started/
*   Verify response time < 300ms with load testing for each page
*   Ensure the dev server is killed once all tests have been run
*   Run `npx --yes @cyclonedx/cyclonedx-npm -o ./dist/artifacts/packages/sbom.json --ignore-npm-errors --omit dev --omit peer --omit optional`
*   Run `./scripts/deployments/validateDistFolders.sh`
*   Repeate this verification cycle for each set of changes

