import { waitFor } from '@testing-library/dom';
import { TestGridsManager, waitForEvent } from 'ag-test-utils';
import { asyncSetTimeout } from 'ag-test-utils/node-utils';

import type { GridApi, GridOptions, IServerSideGetRowsParams } from 'ag-grid-community';
import { ScrollApiModule } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

describe('SSRM block lifecycle', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ScrollApiModule, ServerSideRowModelModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    async function flush(times = 3): Promise<void> {
        for (let i = 0; i < times; ++i) {
            await asyncSetTimeout(0);
        }
    }

    function makeRows(count: number, version = 1) {
        return Array.from({ length: count }, (_, i) => ({ id: i, value: `v${version} Row ${i}` }));
    }

    function respond(params: IServerSideGetRowsParams, rowData: any[], rowCount = rowData.length) {
        params.success({ rowData: rowData.slice(params.request.startRow, params.request.endRow), rowCount });
    }

    function blockStatus(api: GridApi, blockNumber: number): string | undefined {
        return api.getCacheBlockState()[blockNumber]?.pageStatus;
    }

    test('maxBlocksInCache does not evict a block whose request is in flight', async () => {
        const rowData = makeRows(1000);
        const pending: IServerSideGetRowsParams[] = [];
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            cacheBlockSize: 100,
            maxBlocksInCache: 1,
            rowBuffer: 0,
            suppressRowVirtualisation: false,
            getRowId: (params) => String(params.data.id),
            serverSideDatasource: {
                getRows: (params) => {
                    if (params.request.startRow === 900) {
                        pending.push(params);
                        return;
                    }
                    respond(params, rowData);
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await waitForEvent('firstDataRendered', api);

        api.ensureIndexVisible(950);
        await waitFor(() => expect(pending.length).toBe(1));

        // Loading block 1 takes the cache over its cap while block 9 is still in flight.
        api.ensureIndexVisible(150);
        await waitFor(() => expect(!!api.getRowNode('150')).toBe(true));
        expect(blockStatus(api, 9)).toBe('loading');

        // Once its response lands, the out-of-view block is no longer protected and is evicted.
        respond(pending[0], rowData);
        await flush();
        expect(Object.keys(api.getCacheBlockState())).toEqual(['1']);
        expect(!!api.getRowNode('150')).toBe(true);
        expect(api.getRowNode('950')).toBeUndefined();
    });

    test('a block in flight when a soft refresh starts is requested again, and its stale response does not finish the refresh', async () => {
        let rowData = makeRows(10, 1);
        const pending: IServerSideGetRowsParams[] = [];
        let refreshFinishedCount = 0;
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            cacheBlockSize: 100,
            getRowId: (params) => String(params.data.id),
            serverSideDatasource: {
                getRows: (params) => pending.push(params),
            },
            onStoreRefreshed: () => refreshFinishedCount++,
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await flush();
        respond(pending.shift()!, rowData);
        await flush();
        expect(api.getRowNode('0')?.data.value).toBe('v1 Row 0');

        rowData = makeRows(10, 2);
        api.refreshServerSide({ purge: false });
        await flush();
        expect(pending.length).toBe(1);
        const firstRefreshRequest = pending.shift()!;

        rowData = makeRows(10, 3);
        api.refreshServerSide({ purge: false });
        await flush();
        expect(pending.length).toBe(1);
        const secondRefreshRequest = pending.shift()!;

        respond(firstRefreshRequest, makeRows(10, 2));
        await flush();
        expect(refreshFinishedCount).toBe(0);
        expect(api.getRowNode('0')?.data.value).toBe('v1 Row 0');

        respond(secondRefreshRequest, rowData);
        await flush();
        expect(refreshFinishedCount).toBe(1);
        expect(api.getRowNode('0')?.data.value).toBe('v3 Row 0');
    });

    test('getCacheBlockState reports the highest-priority row state of a block', async () => {
        const rowData = makeRows(10);
        const pending: IServerSideGetRowsParams[] = [];
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            cacheBlockSize: 100,
            maxConcurrentDatasourceRequests: 1,
            getRowId: (params) => String(params.data.id),
            serverSideDatasource: {
                getRows: (params) => pending.push(params),
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await waitFor(() => expect(pending.length).toBe(1));
        respond(pending.shift()!, rowData);
        expect(blockStatus(api, 0)).toBe('loaded');

        // The superseded first refresh request holds the only slot, so the second refresh cannot load yet.
        api.refreshServerSide({ purge: false });
        await waitFor(() => expect(pending.length).toBe(1));
        api.refreshServerSide({ purge: false });
        await flush();
        expect(pending.length).toBe(1);

        api.applyServerSideTransaction({ add: [{ id: 10, value: 'added' }] });

        // The added row is loaded, the refreshed rows are not, so the block still needs loading.
        expect(blockStatus(api, 0)).toBe('needsLoading');
    });

    test('retryServerSideLoads updates the model once', async () => {
        const rowData = makeRows(3);
        const pending: IServerSideGetRowsParams[] = [];
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            cacheBlockSize: 100,
            getRowId: (params) => String(params.data.id),
            serverSideDatasource: {
                getRows: (params) => pending.push(params),
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await waitFor(() => expect(pending.length).toBe(1));
        pending.shift()!.fail();
        await flush();

        let modelUpdatedCount = 0;
        api.addEventListener('modelUpdated', () => modelUpdatedCount++);
        api.retryServerSideLoads();
        await waitFor(() => expect(pending.length).toBe(1));
        expect(modelUpdatedCount).toBe(1);

        respond(pending.shift()!, rowData);
        expect(api.getRowNode('2')?.data.value).toBe('v1 Row 2');
    });

    test('only the first success or fail call of a request is honoured', async () => {
        const rowData = makeRows(500);
        const pending: IServerSideGetRowsParams[] = [];
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            cacheBlockSize: 100,
            maxConcurrentDatasourceRequests: 1,
            rowBuffer: 0,
            getRowId: (params) => String(params.data.id),
            serverSideDatasource: {
                getRows: (params) => {
                    if (params.request.startRow === 0) {
                        respond(params, rowData);
                        respond(params, rowData);
                        params.fail();
                        return;
                    }
                    pending.push(params);
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await waitForEvent('firstDataRendered', api);
        expect(blockStatus(api, 0)).toBe('loaded');
        expect(api.getRowNode('0')?.data.value).toBe('v1 Row 0');

        // With one request slot, a second block must wait for the first to settle.
        api.ensureIndexVisible(250);
        await waitFor(() => expect(pending.length).toBe(1));
        api.ensureIndexVisible(450);
        await flush(10);
        expect(pending.length).toBe(1);
    });
});
