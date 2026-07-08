import type { VersionChangelog } from '@ag-website-shared/changes/change-types';

export const v33_3 = {
    deprecations: {
        reactSetGridApi: {
            framework: 'react',
            oldApi: 'Non-functional `setGridApi` prop on `AgGridReact`',
            oldDescription: 'Types allowed for a `setGridApi` callback prop but this was never invoked',
            newApi: null,
            detectWords: ['setGridApi'],
            mitigation:
                'Remove the `setGridApi` prop to preserve existing behaviour (it was never invoked). If the application needs to  obtain the `GridApi`, read `params.api` in the `onGridReady` event or hold a ref to the `AgGridReact` component and read its `api` field. See https://ag-grid.com/react-data-grid/grid-interface/#grid-api',
        },

        agGridReactChildren: {
            framework: 'react',
            oldApi: 'Child elements passed to `<AgGridReact>...</AgGridReact>`',
            oldDescription: 'Types allowed passing children to `AgGridReact` but they were never rendered.',
            newApi: 'runtime warning',
            detectWords: null,
            mitigation:
                'To silence the runtime warning emitted when passing children to AgGridReact, remove any child elements nested inside `AgGridReact`. This will preserve the existing behaviour (children were not rendered).',
        },

        maxComponentCreationTimeMs: {
            framework: 'react',
            oldApi: '`maxComponentCreationTimeMs` prop on `AgGridReact`',
            oldDescription:
                'This prop tuned the React portal component-creation timeout, which now uses a sensible internal default, so setting it is no longer required.',
            newApi: null,
            detectWords: ['maxComponentCreationTimeMs'],
            mitigation:
                'Remove the `maxComponentCreationTimeMs` prop; the grid applies a sensible internal default. If you have a specific reason to override it, contact AG Grid support.',
        },
    },
} satisfies VersionChangelog;
