import type { GridOptions, IServerSideGetRowsParams, IServerSideGetRowsRequest } from 'ag-grid-community';
import { ScrollApiModule } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, waitForEvent } from '../test-utils';
import { asyncSetTimeout } from '../test-utils/node-utils';
import { countLoadingRows } from '../test-utils/ssrm-test-utils';

/**
 * Characterization (golden-master) tests pinning how `gridOptions.serverSideInitialRowCount`
 * shapes the INITIAL LOAD DISPLAY of a FLAT (no rowGroup) SSRM grid:
 *   - the placeholder/loading (stub) rows shown before the first block resolves,
 *   - which block the first server request asks for, and
 *   - how the model reconciles once the real total arrives — both when the real
 *     total EXCEEDS the initial guess and when it is SMALLER.
 *
 * These pin whatever the grid does today (bugs included) so any future change to
 * initial-load sizing/reconciliation surfaces as a deliberate snapshot update. The
 * asserted numbers were adopted from the actual runtime output, not an "ideal".
 *
 * Sibling `ssrm-cache-config.test.ts` also touches `serverSideInitialRowCount`, but
 * from the cache-knob angle (displayed-count == N pre-load, filler stub shape). This
 * file's angle is the initial-load request stream + the reconciliation delta between
 * the initial guess and the real server total — deliberately not re-asserting those.
 *
 * House style: inline datasource + inline request-stream recorder (no shared factory)
 * so each test reads top-to-bottom. RowNode objects are never asserted directly — only
 * scalar counts/booleans — as serializing a circular node crashes the reporter on failure.
 */
describe('SSRM initial row count (characterization)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ScrollApiModule, ServerSideRowModelModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    /** Compact, comparable projection of a request's block range. */
    function blockRange(request: IServerSideGetRowsRequest): [number, number] {
        return [request.startRow!, request.endRow!];
    }

    test('before the first block resolves: initial-count filler rows are displayed as loading stubs and the first request is for block [0,100]', async () => {
        const initialCount = 42;
        const requests: [number, number][] = [];
        // Deferred datasource: stash params so the first block stays in-flight and the
        // pre-resolve display state can be observed.
        const pending: IServerSideGetRowsParams[] = [];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            cacheBlockSize: 100,
            serverSideInitialRowCount: initialCount,
            getRowId: (params) => String(params.data.id),
            serverSideDatasource: {
                getRows: (params) => {
                    requests.push(blockRange(params.request));
                    pending.push(params);
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        // Let the initial block dispatch without resolving it.
        await asyncSetTimeout(30);

        // The grid sizes itself to the configured initial row count before any block
        // resolves, and every one of those rows is a loading/stub row.
        expect(api.getDisplayedRowCount()).toBe(initialCount);
        expect(countLoadingRows(api)).toBe(initialCount);

        // The first (and only) server request so far is for the block starting at row 0.
        expect(requests[0]).toEqual([0, 100]);

        // Drain the in-flight request so the deferred datasource does not leak past the test.
        const rowData = Array.from({ length: 500 }, (_, i) => ({ id: i, value: `Row ${i}` }));
        for (let i = 0, len = pending.length; i < len; ++i) {
            const request = pending[i].request;
            pending[i].success({ rowData: rowData.slice(request.startRow!, request.endRow!), rowCount: 500 });
        }
    });

    test.skip('after load, real total EXCEEDS the initial count: displayed count reflects the real total, not the initial guess', async () => {
        const initialCount = 42;
        const realTotal = 500;
        const rowData = Array.from({ length: realTotal }, (_, i) => ({ id: i, value: `Row ${i}` }));
        const requests: [number, number][] = [];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            cacheBlockSize: 100,
            serverSideInitialRowCount: initialCount,
            getRowId: (params) => String(params.data.id),
            serverSideDatasource: {
                getRows: (params) => {
                    requests.push(blockRange(params.request));
                    const slice = rowData.slice(params.request.startRow!, params.request.endRow!);
                    params.success({ rowData: slice, rowCount: realTotal });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await waitForEvent('firstDataRendered', api);

        // The real total (500) supersedes the initial guess (42): the grid now sizes to
        // the full server total, the first request was for block [0,100], and that block's
        // real data has replaced the initial-count stubs.
        expect(api.getDisplayedRowCount()).toBe(realTotal);
        expect(requests[0]).toEqual([0, 100]);
        expect(!!api.getRowNode('0')).toBe(true);

        // Note: how many *further* blocks have loaded by this point is not asserted. With a
        // synchronous datasource the grid keeps fetching subsequent blocks tick-by-tick, so
        // the count of loaded blocks / remaining loading stubs at `firstDataRendered` is a
        // transient, timing-dependent value (see the skipped sibling in ssrm-block-loading).
    });

    test('after load, real total is SMALLER than the initial count: the grid shrinks to the real total and trailing placeholders are removed', async () => {
        const initialCount = 42;
        const realTotal = 3;
        const rowData = Array.from({ length: realTotal }, (_, i) => ({ id: i, value: `Row ${i}` }));
        const requests: [number, number][] = [];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            cacheBlockSize: 100,
            serverSideInitialRowCount: initialCount,
            getRowId: (params) => String(params.data.id),
            serverSideDatasource: {
                getRows: (params) => {
                    requests.push(blockRange(params.request));
                    const slice = rowData.slice(params.request.startRow!, params.request.endRow!);
                    params.success({ rowData: slice, rowCount: realTotal });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await waitForEvent('firstDataRendered', api);

        // Reconciliation: the initial guess of 42 shrinks to the real total of 3; the
        // trailing 39 placeholder rows are removed and no loading stubs remain.
        expect(api.getDisplayedRowCount()).toBe(realTotal);
        expect(countLoadingRows(api)).toBe(0);
        expect(requests[0]).toEqual([0, 100]);

        await new GridRows(api, 'smaller: shrunk to real total=3').check(`
            ROOT id:<no-id>
            ├── LEAF id:0 id:0 value:"Row 0"
            ├── LEAF id:1 id:1 value:"Row 1"
            └── LEAF id:2 id:2 value:"Row 2"
        `);
    });

    test('baseline without serverSideInitialRowCount: a single filler row shows before load, then the real total', async () => {
        const realTotal = 3;
        const rowData = Array.from({ length: realTotal }, (_, i) => ({ id: i, value: `Row ${i}` }));
        // Deferred datasource to observe the pre-resolve display state.
        const pending: IServerSideGetRowsParams[] = [];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            cacheBlockSize: 100,
            getRowId: (params) => String(params.data.id),
            serverSideDatasource: {
                getRows: (params) => {
                    pending.push(params);
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await asyncSetTimeout(30);

        // Contrast with the initial-count cases: without serverSideInitialRowCount the
        // grid shows a single filler/stub row before the first block resolves.
        expect(api.getDisplayedRowCount()).toBe(1);
        expect(countLoadingRows(api)).toBe(1);

        const modelUpdated = waitForEvent('modelUpdated', api);
        for (let i = 0, len = pending.length; i < len; ++i) {
            const request = pending[i].request;
            pending[i].success({ rowData: rowData.slice(request.startRow!, request.endRow!), rowCount: realTotal });
        }
        await modelUpdated;

        expect(api.getDisplayedRowCount()).toBe(realTotal);
        expect(countLoadingRows(api)).toBe(0);
    });
});
