import { TestGridsManager, asyncSetTimeout, waitForNoLoadingRows } from 'ag-test-utils';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import type { ColDef, GridApi, IViewportDatasourceParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    GRAND_TOTAL_ROW_ID,
    InfiniteRowModelModule,
    NumberFilterModule,
    RowApiModule,
    ScrollApiModule,
    TextFilterModule,
} from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelModule, ViewportRowModelModule } from 'ag-grid-enterprise';

/**
 * `cellDataType` inference under the Server-Side, Infinite and Viewport row models. None of them has
 * data at column-creation time, so every column takes the deferred path and resolves off the first
 * batch that contains rows. A response with no rows resolves nothing and leaves the columns pending.
 */
describe('cellDataType inference under non-client-side row models', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            InfiniteRowModelModule,
            ServerSideRowModelModule,
            ViewportRowModelModule,
            RowGroupingModule,
            ScrollApiModule,
            RowApiModule,
            TextFilterModule,
            NumberFilterModule,
        ],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const COLUMN_DEFS: ColDef[] = [
        { field: 'name' },
        { field: 'year' },
        { field: 'date' },
        { field: 'dateStr' },
        { field: 'done' },
        { field: 'notes' },
    ];

    const FIRST_BATCH = [
        { name: null, year: null, date: null, dateStr: null, done: null, notes: null },
        { name: 'Michael', year: 2000, date: new Date('2000-01-01'), dateStr: '2000-01-01', done: true, notes: null },
    ];

    const inferredType = (api: GridApi, field: string) => api.getColumn(field)!.getColDef().cellDataType;

    /**
     * The row models load their rows off a queue rather than synchronously, so tests wait on the
     * datasource itself signalling that it has served a batch, then flush the tick inference lands in.
     */
    const batchServed = () => {
        let served: () => void;
        const promise = new Promise<void>((resolve) => {
            served = resolve;
        });
        return { promise, serve: () => served() };
    };

    /** Creates a grid whose first (and only) batch of rows is `rowData`, delivered before returning. */
    type CreateGrid = (rowData: any[], columnDefs?: ColDef[]) => Promise<GridApi>;

    const createInfiniteGrid: CreateGrid = async (rowData, columnDefs = COLUMN_DEFS) => {
        const first = batchServed();
        const api = gridsManager.createGrid('grid', {
            columnDefs,
            rowModelType: 'infinite',
            datasource: {
                getRows: (params) => {
                    params.successCallback(rowData, rowData.length);
                    first.serve();
                },
            },
        });
        await first.promise;
        await asyncSetTimeout(0);
        return api;
    };

    const createServerSideGrid: CreateGrid = async (rowData, columnDefs = COLUMN_DEFS) => {
        const first = batchServed();
        const api = gridsManager.createGrid('grid', {
            columnDefs,
            rowModelType: 'serverSide',
            serverSideDatasource: {
                getRows: (params) => {
                    params.success({ rowData, rowCount: rowData.length });
                    first.serve();
                },
            },
        });
        await first.promise;
        await asyncSetTimeout(0);
        return api;
    };

    const createViewportGrid: CreateGrid = async (rowData, columnDefs = COLUMN_DEFS) => {
        const first = batchServed();
        let ds: IViewportDatasourceParams;
        const api = gridsManager.createGrid('grid', {
            columnDefs,
            rowModelType: 'viewport',
            viewportDatasource: {
                init: (params) => {
                    ds = params;
                    params.setRowCount(rowData.length);
                    if (!rowData.length) {
                        // no rows means no range is ever requested, so there is nothing left to serve
                        first.serve();
                    }
                },
                setViewportRange: (firstRow, lastRow) => {
                    const data: Record<number, any> = {};
                    for (let i = firstRow; i <= lastRow; i++) {
                        data[i] = rowData[i];
                    }
                    ds.setRowData(data);
                    first.serve();
                },
            },
        });
        await first.promise;
        await asyncSetTimeout(0);
        return api;
    };

    const rowModels: [name: string, createGrid: CreateGrid][] = [
        ['infinite', createInfiniteGrid],
        ['serverSide', createServerSideGrid],
        ['viewport', createViewportGrid],
    ];

    describe.each(rowModels)('%s row model', (_name, createGrid) => {
        test('infers each base data type from the first batch of rows', async () => {
            const api = await createGrid(FIRST_BATCH);

            expect(inferredType(api, 'name')).toBe('text');
            expect(inferredType(api, 'year')).toBe('number');
            expect(inferredType(api, 'date')).toBe('date');
            expect(inferredType(api, 'dateStr')).toBe('dateString');
            expect(inferredType(api, 'done')).toBe('boolean');
        });

        test('an inferred type brings its editor with it', async () => {
            const api = await createGrid(FIRST_BATCH);

            expect(api.getColumn('year')!.getColDef().cellEditor).toBe('agNumberCellEditor');
        });

        test('a column with no value in the first batch falls back to no data type', async () => {
            const api = await createGrid(FIRST_BATCH);

            expect(inferredType(api, 'notes')).toBe(false);
        });

        test('an explicit `cellDataType: false` suppresses inference', async () => {
            const api = await createGrid(FIRST_BATCH, [{ field: 'year', cellDataType: false }]);

            expect(inferredType(api, 'year')).toBe(false);
        });

        test('an explicitly declared data type is not overridden by inference', async () => {
            const api = await createGrid(FIRST_BATCH, [{ field: 'year', cellDataType: 'text' }]);

            expect(inferredType(api, 'year')).toBe('text');
        });

        test('rebuilding the column definitions keeps the inferred types without new rows', async () => {
            const api = await createGrid(FIRST_BATCH);

            api.setGridOption(
                'columnDefs',
                COLUMN_DEFS.map((colDef) => ({ ...colDef, headerName: `${colDef.field}!` }))
            );
            api.setGridOption('defaultColDef', { minWidth: 50 });
            await asyncSetTimeout(0);

            expect(api.getColumn('year')!.getColDef().headerName).toBe('year!');
            expect(inferredType(api, 'name')).toBe('text');
            expect(inferredType(api, 'year')).toBe('number');
            expect(inferredType(api, 'date')).toBe('date');
            expect(inferredType(api, 'done')).toBe('boolean');
            expect(inferredType(api, 'notes')).toBe(false);
            expect(api.getColumn('year')!.getColDef().cellEditor).toBe('agNumberCellEditor');
        });
    });

    test('a later batch changes nothing, neither a resolved column nor a sparse one', async () => {
        const batches = [[{ year: 1999, notes: null }], [{ year: 2000, notes: 'late' }]];
        let batchIndex = 0;
        const secondBatch = batchServed();
        const api = gridsManager.createGrid('grid', {
            columnDefs: [{ field: 'year' }, { field: 'notes' }],
            rowModelType: 'infinite',
            cacheBlockSize: 1,
            datasource: {
                getRows: (params) => {
                    const index = batchIndex++;
                    params.successCallback(batches[Math.min(index, batches.length - 1)], 2);
                    if (index === 1) {
                        secondBatch.serve();
                    }
                },
            },
        });
        await asyncSetTimeout(0);

        // the first batch types `year`, and `notes` has no value in it so it falls back
        expect(inferredType(api, 'year')).toBe('number');
        expect(inferredType(api, 'notes')).toBe(false);

        api.ensureIndexVisible(1);
        await secondBatch.promise;
        await asyncSetTimeout(0);

        // the second batch holds a value for `notes`, but inference has already resolved
        expect(api.getDisplayedRowAtIndex(1)!.data.year).toBe(2000);
        expect(inferredType(api, 'year')).toBe('number');
        expect(inferredType(api, 'notes')).toBe(false);
    });

    describe('server-side row grouping', () => {
        const LEAF_ROWS = [
            { country: 'UK', year: 2000, done: true },
            { country: 'US', year: 2004, done: false },
        ];

        /**
         * A grouped datasource: the root block holds group rows, which carry only the group key, and
         * expanding a group serves the leaf rows under it.
         */
        const createGroupedGrid = async (columnDefs?: ColDef[]) => {
            const rootBlockServed = batchServed();
            const leafBlockServed = batchServed();
            const api = gridsManager.createGrid('grid', {
                columnDefs: columnDefs ?? [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year' },
                    { field: 'done' },
                ],
                rowModelType: 'serverSide',
                serverSideDatasource: {
                    getRows: (params) => {
                        const { groupKeys } = params.request;
                        if (!groupKeys.length) {
                            const rows = LEAF_ROWS.map(({ country }) => ({ country }));
                            params.success({ rowData: rows, rowCount: rows.length });
                            rootBlockServed.serve();
                            return;
                        }
                        const rows = LEAF_ROWS.filter(({ country }) => country === groupKeys[0]);
                        params.success({ rowData: rows, rowCount: rows.length });
                        leafBlockServed.serve();
                    },
                },
            });
            await rootBlockServed.promise;
            await asyncSetTimeout(0);
            return { api, leafBlockServed };
        };

        const expandFirstGroup = (api: GridApi) => {
            const node = api.getDisplayedRowAtIndex(0)!;
            api.setRowNodeExpanded(node, true);
        };

        test('group rows do not resolve inference, and leaf rows type the columns when a group is expanded', async () => {
            const { api, leafBlockServed } = await createGroupedGrid();

            // the root block is group rows, which hold no value for the leaf columns
            expect(api.getDisplayedRowAtIndex(0)!.key).toBe('UK');
            expect(inferredType(api, 'year')).toBe(false);
            expect(inferredType(api, 'done')).toBe(false);

            expandFirstGroup(api);
            await leafBlockServed.promise;
            await asyncSetTimeout(0);

            expect(inferredType(api, 'year')).toBe('number');
            expect(inferredType(api, 'done')).toBe('boolean');
            expect(api.getColumn('year')!.getColDef().cellEditor).toBe('agNumberCellEditor');
        });

        test('the grouped column is typed from the leaf rows too', async () => {
            const { api, leafBlockServed } = await createGroupedGrid();

            expandFirstGroup(api);
            await leafBlockServed.promise;
            await asyncSetTimeout(0);

            expect(inferredType(api, 'country')).toBe('text');
        });

        test('a column filtered before the leaf rows arrive keeps its filter, rather than being re-typed', async () => {
            const { api, leafBlockServed } = await createGroupedGrid([
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', filter: true },
                { field: 'done' },
            ]);

            // with every group collapsed, `year` is untyped and so offers the Text Filter
            const textModel = { filterType: 'text', type: 'contains', filter: '20' };
            api.setFilterModel({ year: textModel });
            // the filter change reloads the root store, so wait for its group rows before expanding one
            await waitForNoLoadingRows(api);
            expect(api.getFilterModel()).toEqual({ year: textModel });

            expandFirstGroup(api);
            await leafBlockServed.promise;
            await asyncSetTimeout(0);

            // typing `year` as a number would swap in the Number Filter and discard the active model
            expect(api.getFilterModel()).toEqual({ year: textModel });
            expect(inferredType(api, 'year')).toBe(false);
            expect(inferredType(api, 'done')).toBe('boolean');
        });

        test('only the filtered column is kept untyped, not another column showing the same field', async () => {
            const { api, leafBlockServed } = await createGroupedGrid([
                { field: 'country', rowGroup: true, hide: true },
                { colId: 'yearFiltered', field: 'year', filter: true },
                { colId: 'yearPlain', field: 'year' },
            ]);

            api.setFilterModel({ yearFiltered: { filterType: 'text', type: 'contains', filter: '20' } });
            await waitForNoLoadingRows(api);

            expandFirstGroup(api);
            await leafBlockServed.promise;
            await asyncSetTimeout(0);

            expect(api.getColumn('yearFiltered')!.getColDef().cellDataType).toBe(false);
            expect(api.getColumn('yearPlain')!.getColDef().cellDataType).toBe('number');

            // a rebuild keeps both decisions
            api.setGridOption('defaultColDef', { minWidth: 50 });
            await asyncSetTimeout(0);

            expect(api.getColumn('yearFiltered')!.getColDef().cellDataType).toBe(false);
            expect(api.getColumn('yearPlain')!.getColDef().cellDataType).toBe('number');
        });

        test('column state the user sets while awaiting leaf rows survives the inferred column types', async () => {
            const rootBlockServed = batchServed();
            const leafBlockServed = batchServed();
            const api = gridsManager.createGrid('grid', {
                columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'year' }],
                columnTypes: { wide: { width: 222 } },
                dataTypeDefinitions: {
                    wideNumber: {
                        baseDataType: 'number',
                        extendsDataType: 'number',
                        columnTypes: ['wide'],
                        dataTypeMatcher: (value) => typeof value === 'number',
                    },
                },
                rowModelType: 'serverSide',
                serverSideDatasource: {
                    getRows: (params) => {
                        const { groupKeys } = params.request;
                        const rows = groupKeys.length
                            ? LEAF_ROWS.filter(({ country }) => country === groupKeys[0])
                            : LEAF_ROWS.map(({ country }) => ({ country }));
                        params.success({ rowData: rows, rowCount: rows.length });
                        (groupKeys.length ? leafBlockServed : rootBlockServed).serve();
                    },
                },
            });
            await rootBlockServed.promise;
            await asyncSetTimeout(0);

            api.setColumnWidths([{ key: 'year', newWidth: 150 }]);

            expandFirstGroup(api);
            await leafBlockServed.promise;
            await asyncSetTimeout(0);

            expect(api.getColumn('year')!.getColDef().type).toEqual(['wide']);
            expect(api.getColumn('year')!.getActualWidth()).toBe(150);
        });

        test('a column filtered through an explicitly named filter is still typed, as typing keeps that filter', async () => {
            const { api, leafBlockServed } = await createGroupedGrid([
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', filter: 'agNumberColumnFilter' },
            ]);

            const numberModel = { filterType: 'number', type: 'greaterThan', filter: 1990 };
            api.setFilterModel({ year: numberModel });
            await waitForNoLoadingRows(api);

            expandFirstGroup(api);
            await leafBlockServed.promise;
            await asyncSetTimeout(0);

            expect(inferredType(api, 'year')).toBe('number');
            expect(api.getFilterModel()).toEqual({ year: numberModel });
        });
    });

    test('a grand total record extracted from the response is not inferred from', async () => {
        const first = batchServed();
        const api = gridsManager.createGrid('grid', {
            columnDefs: [{ field: 'name' }, { field: 'notes' }],
            rowModelType: 'serverSide',
            getRowId: ({ data }) => data.id,
            serverSideDatasource: {
                getRows: (params) => {
                    // the grand total leads the block, holding an aggregate count for each text column
                    const rowData = [
                        { id: GRAND_TOTAL_ROW_ID, name: 2, notes: 1 },
                        { id: 'a', name: 'Michael', notes: null },
                        { id: 'b', name: 'Natalie', notes: 'late' },
                    ];
                    params.success({ rowData, rowCount: 2 });
                    first.serve();
                },
            },
        });
        await first.promise;
        await asyncSetTimeout(0);

        expect(inferredType(api, 'name')).toBe('text');
        expect(inferredType(api, 'notes')).toBe('text');
    });

    test('a viewport datasource that starts with no rows stays pending, then infers from the rows it pushes', async () => {
        let ds: IViewportDatasourceParams;
        const api = gridsManager.createGrid('grid', {
            columnDefs: [{ field: 'year' }],
            rowModelType: 'viewport',
            viewportDatasource: {
                init: (params) => {
                    ds = params;
                    params.setRowCount(0);
                },
                setViewportRange: (firstRow, lastRow) => {
                    const data: Record<number, any> = {};
                    for (let i = firstRow; i <= lastRow; i++) {
                        data[i] = { year: 2000 };
                    }
                    ds.setRowData(data);
                },
            },
        });
        await asyncSetTimeout(0);

        expect(inferredType(api, 'year')).toBe(false);

        ds!.setRowCount(1);
        await asyncSetTimeout(0);

        expect(api.getDisplayedRowAtIndex(0)!.data.year).toBe(2000);
        expect(inferredType(api, 'year')).toBe('number');
    });

    test('a failed first request leaves columns pending, to resolve from the next response with rows', async () => {
        const first = batchServed();
        const second = batchServed();
        let requestCount = 0;
        const api = gridsManager.createGrid('grid', {
            columnDefs: [{ field: 'year' }],
            rowModelType: 'infinite',
            datasource: {
                getRows: (params) => {
                    if (requestCount++ === 0) {
                        params.failCallback();
                        first.serve();
                    } else {
                        params.successCallback([{ year: 2000 }], 1);
                        second.serve();
                    }
                },
            },
        });
        await first.promise;
        await asyncSetTimeout(0);

        // behaves as `cellDataType: false` while pending
        expect(inferredType(api, 'year')).toBe(false);

        api.refreshInfiniteCache();
        await second.promise;
        await asyncSetTimeout(0);

        expect(inferredType(api, 'year')).toBe('number');
    });

    test('a first response with zero rows leaves columns pending, not permanently resolved', async () => {
        const first = batchServed();
        const second = batchServed();
        let requestCount = 0;
        const api = gridsManager.createGrid('grid', {
            columnDefs: [{ field: 'year' }],
            rowModelType: 'infinite',
            datasource: {
                getRows: (params) => {
                    if (requestCount++ === 0) {
                        params.successCallback([], 0);
                        first.serve();
                    } else {
                        params.successCallback([{ year: 2000 }], 1);
                        second.serve();
                    }
                },
            },
        });
        await first.promise;
        await asyncSetTimeout(0);

        expect(inferredType(api, 'year')).toBe(false);

        api.refreshInfiniteCache();
        await second.promise;
        await asyncSetTimeout(0);

        expect(inferredType(api, 'year')).toBe('number');
    });

    test('with the Client-Side Row Model, a column added once the rows are cleared holds its filter model back until rows return', async () => {
        // created without rows, so the first inference is deferred until rows arrive
        const api = gridsManager.createGrid('grid', { columnDefs: [{ field: 'name' }] });
        api.setGridOption('rowData', [{ name: 'Michael' }]);
        expect(inferredType(api, 'name')).toBe('text');
        api.setGridOption('rowData', []);
        api.setGridOption('columnDefs', [{ field: 'name' }, { field: 'year', filter: true }]);

        const numberModel = { filterType: 'number', type: 'greaterThan', filter: 1990 };
        api.setFilterModel({ year: numberModel });
        api.setGridOption('rowData', [{ name: 'Michael', year: 2000 }]);
        await asyncSetTimeout(0);

        expect(inferredType(api, 'year')).toBe('number');
        expect(api.getFilterModel()).toEqual({ year: numberModel });
    });

    test('re-binding the datasource does not re-infer a column that has already resolved', async () => {
        const api = await createInfiniteGrid([{ year: 1999 }], [{ field: 'year' }]);

        expect(inferredType(api, 'year')).toBe('number');

        const rebound = batchServed();
        api.setGridOption('datasource', {
            getRows: (params) => {
                params.successCallback([{ year: '2000' }], 1);
                rebound.serve();
            },
        });
        await rebound.promise;
        await asyncSetTimeout(0);

        // the re-bound datasource serves strings, which do not re-type the resolved column
        expect(api.getDisplayedRowAtIndex(0)!.data.year).toBe('2000');
        expect(inferredType(api, 'year')).toBe('number');
    });
});
