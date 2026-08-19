// Every vitest project in the repo, fed to `test.projects` by the root vitest.config.ts. A plain default
// export, not `defineWorkspace`: the IDE's Vitest extension still discovers projects from this file.
export default [
    'packages/ag-stack',
    'packages/ag-grid-community',
    'packages/ag-grid-enterprise',
    'community-modules/locale',
    'testing/behavioural',
    'documentation/ag-grid-docs',
    'external/ag-website-shared',
];
