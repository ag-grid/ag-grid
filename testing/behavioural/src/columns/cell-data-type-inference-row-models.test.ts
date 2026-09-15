import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import type { ColDef, GridApi, IViewportDatasourceParams } from 'ag-grid-community';
import { InfiniteRowModelModule, ScrollApiModule } from 'ag-grid-community';
import { ServerSideRowModelModule, ViewportRowModelModule } from 'ag-grid-enterprise';

/**
 * `cellDataType` inference under the Server-Side, Infinite and Viewport row models. None of them has
 * data at column-creation time, so every column takes the deferred path and resolves off the first
 * batch that contains rows. A response with no rows resolves nothing and leaves the columns pending.
 */
describe('cellDataType inference under non-client-side row models', () => {
    const gridsManager = new TestGridsManager({
        modules: [InfiniteRowModelModule, ServerSideRowModelModule, ViewportRowModelModule, ScrollApiModule],
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
