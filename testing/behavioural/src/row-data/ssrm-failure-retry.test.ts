import type { GridOptions } from 'ag-grid-community';
import { ScrollApiModule } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, waitForEvent } from '../test-utils';
import { asyncSetTimeout } from '../test-utils/node-utils';
import { countLoadingRows } from '../test-utils/ssrm-test-utils';

/**
 * Characterization tests pinning the current SSRM failure/retry mechanics.
 *
 * These are golden-master tests: they record whatever the grid does *today*
 * when a datasource load fails via `params.fail()` and when the failed load is
 * re-driven via `api.retryServerSideLoads()`. Any behaviour that looks like a
 * latent bug (e.g. a failed load leaving loading rows in place) is frozen here
 * as the expected baseline — the point is to detect change, not to prescribe
 * the "correct" behaviour.
 *
 * Setup is inline per the behavioural-suite house style: each test records its
 * own request stream and branches on an attempt counter to make the first load
 * fail and later loads succeed.
 */
describe('SSRM failure and retry', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ScrollApiModule, ServerSideRowModelModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    /** Flush a few microtask/macrotask turns so a fail() settles without waiting forever. */
    async function flush(times = 3): Promise<void> {
        for (let i = 0; i < times; ++i) {
            await asyncSetTimeout(0);
        }
    }

    test('first load calls params.fail() — grid state after the failure', async () => {
        const totalRows = 3;
        const rowData = Array.from({ length: totalRows }, (_, i) => ({ id: i, value: `Row ${i}` }));
        const requests: [number, number][] = [];
        let attempt = 0;

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            cacheBlockSize: 100,
            getRowId: (params) => String(params.data.id),
            serverSideDatasource: {
                getRows: (params) => {
                    requests.push([params.request.startRow!, params.request.endRow!]);
                    attempt++;
                    if (attempt === 1) {
                        params.fail();
                        return;
                    }
                    const slice = rowData.slice(params.request.startRow, params.request.endRow);
                    params.success({ rowData: slice, rowCount: totalRows });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);

        // Let the first (failing) load settle.
        await flush();

        // The block was requested exactly once and then failed.
        expect(requests).toEqual([[0, 100]]);

        // Pin what the row model looks like after a failed load: the single filler
        // (loading) row remains in place — the failure does not clear it.
        await new GridRows(api, 'ssrm failure after fail').check(`
            ROOT id:<no-id>
            └── filler id:rowIndex:0
        `);

        // Concrete counts characterising the post-failure state.
        expect(countLoadingRows(api)).toBe(1);
        expect(api.getDisplayedRowCount()).toBe(1);
        // No leaf node exists yet — the data never arrived.
        expect(!!api.getRowNode('0')).toBe(false);
    });

    test('retryServerSideLoads re-requests the failed block and renders rows on success', async () => {
        const totalRows = 3;
        const rowData = Array.from({ length: totalRows }, (_, i) => ({ id: i, value: `Row ${i}` }));
        const requests: [number, number][] = [];
        let attempt = 0;

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            cacheBlockSize: 100,
            getRowId: (params) => String(params.data.id),
            serverSideDatasource: {
                getRows: (params) => {
                    requests.push([params.request.startRow!, params.request.endRow!]);
                    attempt++;
                    if (attempt === 1) {
                        params.fail();
                        return;
                    }
                    const slice = rowData.slice(params.request.startRow, params.request.endRow);
                    params.success({ rowData: slice, rowCount: totalRows });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);

        // First load fails.
        await flush();
        expect(requests).toEqual([[0, 100]]);
        expect(countLoadingRows(api)).toBe(1);

        // Retry re-drives the failed block; the second attempt succeeds.
        api.retryServerSideLoads();
        await flush();

        // The failed block is requested a second time.
        expect(requests).toEqual([
            [0, 100],
            [0, 100],
        ]);

        // Rows now render and no loading rows remain.
        expect(countLoadingRows(api)).toBe(0);
        expect(api.getDisplayedRowCount()).toBe(totalRows);
        expect(!!api.getRowNode('0')).toBe(true);

        await new GridRows(api, 'ssrm retry after success').check(`
            ROOT id:<no-id>
            ├── LEAF id:0 id:0 value:"Row 0"
            ├── LEAF id:1 id:1 value:"Row 1"
            └── LEAF id:2 id:2 value:"Row 2"
        `);
    });

    test('failure on a second block leaves block 0 intact; retry recovers block 2', async () => {
        const totalRows = 500;
        const rowData = Array.from({ length: totalRows }, (_, i) => ({ id: i, value: `Row ${i}` }));
        const requests: [number, number][] = [];
        // Fail only the load for block 2 ([200,300)) the first time it is requested.
        let block2Attempts = 0;

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            cacheBlockSize: 100,
            rowBuffer: 0,
            suppressRowVirtualisation: false,
            getRowId: (params) => String(params.data.id),
            serverSideDatasource: {
                getRows: (params) => {
                    const startRow = params.request.startRow!;
                    requests.push([startRow, params.request.endRow!]);
                    if (startRow === 200) {
                        block2Attempts++;
                        if (block2Attempts === 1) {
                            params.fail();
                            return;
                        }
                    }
                    const slice = rowData.slice(params.request.startRow, params.request.endRow);
                    params.success({ rowData: slice, rowCount: totalRows });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await waitForEvent('firstDataRendered', api);

        // Block 0 loaded successfully on the initial render.
        expect(!!api.getRowNode('0')).toBe(true);

        // Scroll to row 250 (block 2). That load fails.
        api.ensureIndexVisible(250);
        await flush();

        // Block 0 rows are still present after the block 2 failure.
        expect(!!api.getRowNode('0')).toBe(true);
        // Block 2 rows never arrived — its nodes are loading/absent.
        expect(!!api.getRowNode('250')).toBe(false);
        // At least one loading row remains for the failed block.
        expect(countLoadingRows(api)).toBeGreaterThan(0);

        const block2RequestsBefore = requests.filter(([start]) => start === 200).length;
        expect(block2RequestsBefore).toBe(1);

        // Retry re-drives the failed block; this time it succeeds.
        api.retryServerSideLoads();
        await flush();

        // Block 2 was requested again and now resolves.
        const block2RequestsAfter = requests.filter(([start]) => start === 200).length;
        expect(block2RequestsAfter).toBe(block2RequestsBefore + 1);
        expect(!!api.getRowNode('250')).toBe(true);
        // Block 0 remained available throughout.
        expect(!!api.getRowNode('0')).toBe(true);
    });
});
