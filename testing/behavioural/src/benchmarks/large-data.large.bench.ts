// 1M-row grid creation to first render, across module sets (minimal, all community, all enterprise) and
// features (flat, row selection, row grouping). 20 columns: 3 category fields, a boolean, a date-time and 15 numeric
// ones, so the boolean and date-time cell paths are measured as well as text and numbers.
//
// Opt-in, as each call takes seconds: run with `./benches.sh --large "large-data"`. The call is one createGrid
// plus the frame flush that renders the first rows; the previous call's grid is destroyed untimed.
import { suite } from 'vitest';

import type { ColDef, GridOptions, Module } from 'ag-grid-community';
import { AllCommunityModule, ClientSideRowModelModule, RowSelectionModule, getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule, RowGroupingModule } from 'ag-grid-enterprise';

import { LARGE_ROW_COUNT, buildLargeData } from './bench-data';
import { BenchGridsManager, bench, untimedPrepare } from './bench-utils';

const VALUE_COLUMNS = 15;
const rowData = buildLargeData(VALUE_COLUMNS);

const valueColumns = (): ColDef[] => Array.from({ length: VALUE_COLUMNS }, (_, c) => ({ field: `v${c}`, width: 100 }));

// `Date` values are inferred as `date`, so the type is set to take the date-time path.
const typedColumns = (): ColDef[] => [{ field: 'active' }, { field: 'recorded', cellDataType: 'dateTime' }];

const flatColumns = (): ColDef[] => [
    { field: 'territory' },
    { field: 'species' },
    { field: 'sex' },
    ...typedColumns(),
    ...valueColumns(),
];
const groupedColumns = (): ColDef[] => [
    { field: 'territory', rowGroup: true, hide: true },
    { field: 'species', rowGroup: true, hide: true },
    { field: 'sex' },
    ...typedColumns(),
    ...valueColumns(),
];

interface Feature {
    name: string;
    gridOptions: () => GridOptions;
    /** What the minimal module set registers for this feature, on top of `ClientSideRowModelModule`. */
    minimalModules: Module[];
    /** Row grouping is enterprise-only, so `AllCommunityModule` cannot run it. */
    community: boolean;
}

const features: Feature[] = [
    {
        name: 'flat',
        gridOptions: () => ({ columnDefs: flatColumns() }),
        minimalModules: [],
        community: true,
    },
    {
        name: 'row selection',
        gridOptions: () => ({ columnDefs: flatColumns(), rowSelection: { mode: 'multiRow' } }),
        minimalModules: [RowSelectionModule],
        community: true,
    },
    {
        name: 'row grouping (collapsed)',
        gridOptions: () => ({ columnDefs: groupedColumns() }),
        minimalModules: [RowGroupingModule],
        community: false,
    },
];

const moduleSets = (feature: Feature): { name: string; modules: Module[] }[] => [
    { name: 'minimal', modules: [ClientSideRowModelModule, ...feature.minimalModules] },
    ...(feature.community ? [{ name: 'all community', modules: [AllCommunityModule] }] : []),
    { name: 'all enterprise', modules: [AllEnterpriseModule] },
];

suite(`1M rows — grid creation to first render (${flatColumns().length} columns)`, () => {
    const gridsManager = new BenchGridsManager();
    // Pending animation frames keep a destroyed grid alive until one fires, so without the wait 1M-row grids exhaust the heap.
    const releaseGrids = async () => {
        gridsManager.destroyAll();
        await new Promise((resolve) => requestAnimationFrame(resolve));
        (globalThis as { gc?: () => void }).gc?.();
    };

    for (const feature of features) {
        for (const { name, modules } of moduleSets(feature)) {
            const gridOptions = feature.gridOptions();
            bench(
                `${feature.name}, ${name} modules, ${LARGE_ROW_COUNT} rows`,
                untimedPrepare(releaseGrids, () => {
                    const api = gridsManager.createGrid('L', { ...gridOptions, rowData }, { modules });
                    api.flushAllAnimationFrames();
                }),
                {
                    setup: async () => {
                        await gridsManager.reset();
                        const api = gridsManager.createGrid('L', { ...gridOptions, rowData }, { modules });
                        api.flushAllAnimationFrames();
                        // A grid that rendered nothing would read as a very fast bench.
                        const rendered = getGridElement(api)?.querySelectorAll('.ag-row').length;
                        await releaseGrids();
                        if (!rendered) {
                            throw new Error('the grid rendered no rows');
                        }
                    },
                    teardown: () => gridsManager.reset(),
                    // Each call takes seconds: a couple of warmup calls and a window past the default cap.
                    warmupCalls: 2,
                    warmupTime: 0,
                    time: 1,
                    timeout: 900_000,
                }
            );
        }
    }
});
