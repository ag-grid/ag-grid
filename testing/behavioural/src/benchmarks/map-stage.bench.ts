// CSRM 'map' stage in isolation: flattening rows to display, then assigning/clearing row tops and
// indexes. `refreshClientSideRowModel('map')` re-runs only that last pipeline step, so these measure
// the row-positioning work without the grouping, aggregation or sorting stages ahead of it.
// The three shapes differ in how many of the tree's nodes end up displayed: all of them (flat),
// most of them (expanded groups), or almost none (collapsed groups).
import { bench, suite } from 'vitest';

import type { ColDef, GridApi } from 'ag-grid-community';
import { ClientSideRowModelApiModule, ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import type { FlatRow, GroupedRow } from './bench-data';
import { buildFlatData, buildGroupedData } from './bench-data';
import { BenchGridsManager, benchDefaults } from './bench-utils';

const ROW_COUNT = 20_000;

suite(`map stage — flat (${ROW_COUNT} rows)`, () => {
    const gridsManager = new BenchGridsManager({
        modules: [ClientSideRowModelModule, ClientSideRowModelApiModule],
    });
    let api!: GridApi<FlatRow>;

    const rowData = buildFlatData(ROW_COUNT);

    bench(
        `remap ${ROW_COUNT} displayed rows`,
        () => {
            api.refreshClientSideRowModel('map');
        },
        benchDefaults({
            setup: () => {
                api ??= gridsManager.createGrid('map-flat', {
                    columnDefs: [{ field: 'name' }, { field: 'value' }],
                    rowData,
                    getRowId: ({ data }) => data.id,
                });
            },
            teardown: async () => {
                api = undefined!;
                await gridsManager.reset();
            },
        })
    );
});

// Both grouped benches share this shape; only `groupDefaultExpanded` differs, which is what decides
// how much of the tree is displayed and therefore how much row positioning the stage has to do.
const groupColumnDefs: ColDef[] = [
    { field: 'group1', rowGroup: true, hide: true },
    { field: 'group2', rowGroup: true, hide: true },
    { field: 'group3', rowGroup: true, hide: true },
    { field: 'value' },
];

suite(`map stage — grouped (3 levels, ${ROW_COUNT} rows)`, () => {
    const gridsManager = new BenchGridsManager({
        modules: [ClientSideRowModelModule, ClientSideRowModelApiModule, RowGroupingModule],
    });
    let api!: GridApi<GroupedRow>;

    const rowData = buildGroupedData(ROW_COUNT);

    for (const expanded of [true, false]) {
        bench(
            `remap with groups ${expanded ? 'expanded' : 'collapsed'}`,
            () => {
                api.refreshClientSideRowModel('map');
            },
            benchDefaults({
                setup: () => {
                    api ??= gridsManager.createGrid(`map-grouped-${expanded ? 'expanded' : 'collapsed'}`, {
                        columnDefs: groupColumnDefs,
                        rowData,
                        groupDefaultExpanded: expanded ? -1 : 0,
                        getRowId: ({ data }) => data.id,
                    });
                },
                teardown: async () => {
                    api = undefined!;
                    await gridsManager.reset();
                },
            })
        );
    }
});
