// Flat (ungrouped) CSRM pipeline benchmarks on 30k rows: filtering, sorting (delta vs full), and the
// combined filter+sort pipeline. Merged from the former flat-filtering / flat-sorting / flat-pipeline
// files; all three share the same row data via bench-data's flat builders.
import { bench, suite } from 'vitest';

import type { ApplyColumnStateParams, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule, TextFilterModule } from 'ag-grid-community';

import type { FlatRow } from './bench-data';
import { buildFlatData, buildFlatSortUpdate, buildFlatUpdate } from './bench-data';
import { BenchGridsManager, benchDefaults, untimedPrepare } from './bench-utils';

const ROW_COUNT = 15_000;
const baseRowData = buildFlatData(ROW_COUNT);

suite('flat grid — filtering', () => {
    const gridsManager = new BenchGridsManager({ modules: [ClientSideRowModelModule, TextFilterModule] });
    let api!: GridApi<FlatRow>;

    // Smaller dataset + a realistic 10% update (was the full 15k with a 30% churn): the filter toggle is
    // GC-spike-bound, and both levers cut the pauses without changing what the bench exercises.
    const FILTER_ROW_COUNT = 10_000;
    const filterData = baseRowData.slice(0, FILTER_ROW_COUNT);
    const updatedRowData = buildFlatUpdate(filterData, 0.1);

    const options = benchDefaults({
        setup: async () => {
            await gridsManager.reset();
            api = gridsManager.createGrid('flat-filter', {
                columnDefs: [{ field: 'name', filter: 'agTextColumnFilter' }, { field: 'value' }],
                rowData: filterData,
                getRowId: ({ data }) => data.id,
            });
        },
    });

    const filterAAA = { name: { filterType: 'text', type: 'contains', filter: 'aaa' } };
    let filterOn = false;
    bench(
        `toggle text filter on/off ${FILTER_ROW_COUNT} rows`,
        () => {
            filterOn = !filterOn;
            api.setFilterModel(filterOn ? filterAAA : null);
            api.flushAllAnimationFrames();
        },
        options
    );

    const filterBB = { name: { filterType: 'text', type: 'contains', filter: 'bb' } };
    let useUpdated = false;
    let filtered = false;
    bench(
        `immutable data update with active filter ${FILTER_ROW_COUNT} rows`,
        () => {
            // The filter is set once, by the first call; every call then swaps the data under it.
            if (!filtered) {
                api.setFilterModel(filterBB);
                filtered = true;
            }
            useUpdated = !useUpdated;
            api.setGridOption('rowData', useUpdated ? updatedRowData : filterData);
            api.flushAllAnimationFrames();
        },
        options
    );
});

suite('flat grid — sorting (delta vs full)', () => {
    const gridsManager = new BenchGridsManager({ modules: [ClientSideRowModelModule, ColumnApiModule] });
    let api!: GridApi<FlatRow>;

    // Smaller than the shared 15k dataset: the full re-sort here is GC-spike-bound (p99 ≫ median), and
    // fewer rows cut the pauses far more effectively than more samples would.
    const SORT_ROW_COUNT = 8_000;
    const sortData = baseRowData.slice(0, SORT_ROW_COUNT);
    const updateRatio = 0.3;
    const shuffleRatio = 0.05;
    const updatedRowData = buildFlatSortUpdate(sortData, updateRatio, shuffleRatio);
    const updateLabel = `${Math.round(updateRatio * 100)}% updates (${Math.floor(SORT_ROW_COUNT * updateRatio)}/${SORT_ROW_COUNT})`;

    // The update benches start sorted, so each data swap is re-sorted; the sort bench starts unsorted.
    const options = (deltaSort: boolean, sorted: boolean) =>
        benchDefaults({
            setup: async () => {
                await gridsManager.reset();
                api = gridsManager.createGrid('flat-sort', {
                    columnDefs: [{ field: 'name', sort: sorted ? 'asc' : null }],
                    deltaSort,
                    rowData: sortData,
                    getRowId: ({ data }) => data.id,
                });
            },
        });

    const sortAsc: ApplyColumnStateParams = { state: [{ colId: 'name', sort: 'asc' }] };
    const sortDesc: ApplyColumnStateParams = { state: [{ colId: 'name', sort: 'desc' }] };

    let sortAscending = true;
    bench(
        `sort ${SORT_ROW_COUNT} rows`,
        () => {
            api.applyColumnState(sortAscending ? sortAsc : sortDesc);
            api.flushAllAnimationFrames();
            sortAscending = !sortAscending;
        },
        options(true, false)
    );

    let useUpdatedDelta = false;
    bench(
        `delta sort with ${updateLabel}`,
        () => {
            useUpdatedDelta = !useUpdatedDelta;
            api.setGridOption('rowData', useUpdatedDelta ? updatedRowData : sortData);
            api.flushAllAnimationFrames();
        },
        options(true, true)
    );

    let useUpdatedFull = false;
    bench(
        `full sort with ${updateLabel}`,
        () => {
            useUpdatedFull = !useUpdatedFull;
            api.setGridOption('rowData', useUpdatedFull ? updatedRowData : sortData);
            api.flushAllAnimationFrames();
        },
        options(false, true)
    );
});

suite('flat grid — filter + sort pipeline', () => {
    const gridsManager = new BenchGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule, TextFilterModule],
    });
    let api!: GridApi<FlatRow>;

    const updatedRowData = buildFlatUpdate(baseRowData);

    const options = benchDefaults({
        setup: async () => {
            await gridsManager.reset();
            api = gridsManager.createGrid('flat-pipeline', {
                columnDefs: [{ field: 'name', filter: 'agTextColumnFilter' }, { field: 'value' }],
                rowData: baseRowData,
                getRowId: ({ data }) => data.id,
            });
        },
    });

    const sortAsc: ApplyColumnStateParams = { state: [{ colId: 'name', sort: 'asc' }] };
    const noSort: ApplyColumnStateParams = { state: [{ colId: 'name', sort: null }] };
    const filterAA = { name: { filterType: 'text', type: 'contains', filter: 'aa' } };

    bench(
        `filter + sort ${ROW_COUNT} rows`,
        // Filter and sort are removed untimed, so every call applies both to the full row set.
        untimedPrepare(
            () => {
                api.setFilterModel(null);
                api.applyColumnState(noSort);
                api.flushAllAnimationFrames();
            },
            () => {
                api.setFilterModel(filterAA);
                api.applyColumnState(sortAsc);
                api.flushAllAnimationFrames();
            }
        ),
        options
    );

    let useUpdated = false;
    let filtered = false;
    bench(
        `immutable update with filter + sort active ${ROW_COUNT} rows`,
        () => {
            // Filter + sort are set on the first call; then the rows alternate between the two data sets.
            if (!filtered) {
                api.setFilterModel(filterAA);
                api.applyColumnState(sortAsc);
                filtered = true;
            }
            useUpdated = !useUpdated;
            api.setGridOption('rowData', useUpdated ? updatedRowData : baseRowData);
            api.flushAllAnimationFrames();
        },
        options
    );
});
