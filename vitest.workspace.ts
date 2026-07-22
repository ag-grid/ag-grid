import { defineWorkspace } from 'vitest/config';

// Every vitest project in the repo, so the IDE's Vitest extension discovers them all from this one file.
// `./behave.sh` runs the merged unit suite only — package (London-school) tests plus the behavioural
// (Chicago-school) black-box suite — by filtering to those projects with --project; the node-env tooling
// suites (docs, ag-website-shared) stay discoverable here and keep their own nx targets for CI.
// Each entry keeps its own vitest.config.ts (env, aliases, setup); the unit projects carry a `test.name`.
export default defineWorkspace([
    'packages/ag-stack',
    'packages/ag-grid-community',
    'packages/ag-grid-enterprise',
    'community-modules/locale',
    'testing/behavioural',
    'documentation/ag-grid-docs',
    'external/ag-website-shared',
]);
