// 1M-row grid creation to first render, across module sets (minimal, all community, all enterprise), features (flat,
// row selection, row grouping) and two 20-column sets: 3 category fields plus 17 numeric ones, and 3 category fields,
// a boolean, a date-time and 15 numeric ones. Each setup runs with both, so the cost of the boolean and date-time cell
// paths shows as the gap between the two.
//
// Opt-in, as each call takes seconds: run with `./benches.sh --large "large-data"`. The call is one createGrid
// plus the frame flush that renders the first rows; the previous call's grid is destroyed untimed.
import { suite } from 'vitest';

import type { ColDef, GridOptions, Module } from 'ag-grid-community';
import { AllCommunityModule, ClientSideRowModelModule, RowSelectionModule, getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule, RowGroupingModule } from 'ag-grid-enterprise';

import { LARGE_ROW_COUNT, buildLargeData } from './bench-data';
import { BenchGridsManager, bench, untimedPrepare } from './bench-utils';

const COLUMN_COUNT = 20;
// Both column sets read the same rows, so only one 1M-row array is held in memory.
const rowData = buildLargeData(COLUMN_COUNT - 3);

const valueColumns = (count: number): ColDef[] =>
    Array.from({ length: count }, (_, c) => ({ field: `v${c}`, width: 100 }));

interface ColumnSet {
    name: string;
    /** The columns after the three category fields. */
    columns: () => ColDef[];
}

const columnSets: ColumnSet[] = [
    { name: 'numeric', columns: () => valueColumns(COLUMN_COUNT - 3) },
    {
        name: 'mixed types',
        // `Date` values are inferred as `date`, so the type is set to take the date-time path.
        columns: () => [
            { field: 'active' },
            { field: 'recorded', cellDataType: 'dateTime' },
            ...valueColumns(COLUMN_COUNT - 5),
        ],
    },
];

const flatColumns = (columnSet: ColumnSet): ColDef[] => [
    { field: 'territory' },
    { field: 'species' },
    { field: 'sex' },
    ...columnSet.columns(),
];
const groupedColumns = (columnSet: ColumnSet): ColDef[] => [
    { field: 'territory', rowGroup: true, hide: true },
    { field: 'species', rowGroup: true, hide: true },
    { field: 'sex' },
    ...columnSet.columns(),
];

interface Feature {
    name: string;
    gridOptions: (columnSet: ColumnSet) => GridOptions;
    /** What the minimal module set registers for this feature, on top of `ClientSideRowModelModule`. */
    minimalModules: Module[];
    /** Row grouping is enterprise-only, so `AllCommunityModule` cannot run it. */
    community: boolean;
}

const features: Feature[] = [
    {
        name: 'flat',
        gridOptions: (columnSet) => ({ columnDefs: flatColumns(columnSet) }),
        minimalModules: [],
        community: true,
    },
    {
        name: 'row selection',
        gridOptions: (columnSet) => ({ columnDefs: flatColumns(columnSet), rowSelection: { mode: 'multiRow' } }),
        minimalModules: [RowSelectionModule],
        community: true,
    },
    {
        name: 'row grouping (collapsed)',
        gridOptions: (columnSet) => ({ columnDefs: groupedColumns(columnSet) }),
        minimalModules: [RowGroupingModule],
        community: false,
    },
];

const moduleSets = (feature: Feature): { name: string; modules: Module[] }[] => [
    { name: 'minimal', modules: [ClientSideRowModelModule, ...feature.minimalModules] },
    ...(feature.community ? [{ name: 'all community', modules: [AllCommunityModule] }] : []),
    { name: 'all enterprise', modules: [AllEnterpriseModule] },
];

suite(`1M rows — grid creation to first render (${COLUMN_COUNT} columns)`, () => {
    const gridsManager = new BenchGridsManager();
    // Pending animation frames keep a destroyed grid alive until one fires, so without the wait 1M-row grids exhaust the heap.
    const releaseGrids = async () => {
        gridsManager.destroyAll();
        await new Promise((resolve) => requestAnimationFrame(resolve));
        (globalThis as { gc?: () => void }).gc?.();
    };

    for (const feature of features) {
        for (const { name, modules } of moduleSets(feature)) {
            for (const columnSet of columnSets) {
                const gridOptions = feature.gridOptions(columnSet);
                bench(
                    `${feature.name}, ${name} modules, ${columnSet.name} columns, ${LARGE_ROW_COUNT} rows`,
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
    }
});
