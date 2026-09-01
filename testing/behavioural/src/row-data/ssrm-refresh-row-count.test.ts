import { TestGridsManager, asyncSetTimeout, waitForEvent } from 'ag-test-utils';
import { countLoadingRows } from 'ag-test-utils/ssrm-test-utils';

import type { GridApi, GridOptions, IServerSideGetRowsParams } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

/**
 * A non-purge refresh creates no stub rows, so it is awaited via `storeRefreshed` captured BEFORE
 * the call; the count is only re-derived a further round trip later, when the trailing block comes
 * back short - hence `settle()` waits by condition rather than by a guessed delay.
 */
describe('SSRM refreshServerSide row count (AG-17574)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ServerSideRowModelModule],
    });

    afterEach(() => gridsManager.reset());

    /** The fake backend never supplies `rowCount`, so the grid must infer it from block lengths. */
    function createGridOptions(served: { count: number }, blockSize: number, requests: number[][]): GridOptions {
        const allRows = Array.from({ length: 1000 }, (_, i) => ({ id: String(i), value: `Row ${i}` }));
        return {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            cacheBlockSize: blockSize,
            getRowId: (params) => params.data.id,
            serverSideDatasource: {
                getRows: (params: IServerSideGetRowsParams) => {
                    requests.push([params.request.startRow!, params.request.endRow!]);
                    const available = allRows.slice(0, served.count);
                    params.success({ rowData: available.slice(params.request.startRow!, params.request.endRow!) });
                },
            },
        };
    }

    /**
     * Wait until the inferred row count has converged: the last row index is known and nothing is
     * still loading. Condition-based, so it neither races the trailing block request nor sleeps.
     */
    async function settle(api: GridApi) {
        for (let i = 0; i < 200; i++) {
            await asyncSetTimeout(0);
            if (api.isLastRowIndexKnown() && countLoadingRows(api) === 0) {
                return;
            }
        }
    }

    /** Perform a non-purge refresh and wait for the inferred count to converge again. */
    async function refreshAndSettle(api: GridApi) {
        const refreshed = waitForEvent('storeRefreshed', api);
        api.refreshServerSide({ purge: false });
        await refreshed;
        await settle(api);
    }

    test('a later, larger response grows the inferred row count again (single block)', async () => {
        const served = { count: 10 };
        const requests: number[][] = [];
        const api = gridsManager.createGrid('myGrid', createGridOptions(served, 10, requests));

        await waitForEvent('firstDataRendered', api);
        await settle(api);

        // Count inferred from block lengths, no rowCount supplied.
        expect(api.getDisplayedRowCount()).toBe(10);
        expect(api.isLastRowIndexKnown()).toBe(true);

        // The backend now has fewer rows than a block: the short response infers the last row.
        served.count = 3;
        await refreshAndSettle(api);

        expect(api.getDisplayedRowCount()).toBe(3);
        expect(api.isLastRowIndexKnown()).toBe(true);
        expect(!!api.getRowNode('9')).toBe(false);

        // The backend has all its rows back - the grid must be able to grow the count again.
        served.count = 10;
        await refreshAndSettle(api);

        expect(api.getDisplayedRowCount()).toBe(10);
        expect(api.isLastRowIndexKnown()).toBe(true);
        expect(!!api.getRowNode('9')).toBe(true);
    });

    test('a later, larger response grows the inferred row count again (multiple blocks)', async () => {
        const served = { count: 25 };
        const requests: number[][] = [];
        const api = gridsManager.createGrid('myGrid', createGridOptions(served, 10, requests));

        await waitForEvent('firstDataRendered', api);
        await settle(api);

        expect(api.getDisplayedRowCount()).toBe(25);
        expect(api.isLastRowIndexKnown()).toBe(true);

        served.count = 8;
        await refreshAndSettle(api);

        expect(api.getDisplayedRowCount()).toBe(8);
        expect(api.isLastRowIndexKnown()).toBe(true);

        served.count = 25;
        await refreshAndSettle(api);

        expect(api.getDisplayedRowCount()).toBe(25);
        expect(api.isLastRowIndexKnown()).toBe(true);
        expect(!!api.getRowNode('24')).toBe(true);
    });

    test('an explicitly supplied row count survives a non-purge refresh', async () => {
        const requests: number[][] = [];
        let supplyRowCount = true;
        const allRows = Array.from({ length: 10 }, (_, i) => ({ id: String(i), value: `Row ${i}` }));
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            cacheBlockSize: 10,
            getRowId: (params) => params.data.id,
            serverSideDatasource: {
                getRows: (params: IServerSideGetRowsParams) => {
                    requests.push([params.request.startRow!, params.request.endRow!]);
                    params.success({
                        rowData: allRows.slice(params.request.startRow!, params.request.endRow!),
                        rowCount: supplyRowCount ? allRows.length : undefined,
                    });
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await settle(api);

        expect(api.getDisplayedRowCount()).toBe(10);
        expect(api.isLastRowIndexKnown()).toBe(true);
        expect(requests).toEqual([[0, 10]]);

        // The refresh responses omit `rowCount`, but the extent the datasource supplied is
        // authoritative - so the refresh must neither report an unknown last row nor probe past it.
        supplyRowCount = false;
        await refreshAndSettle(api);

        expect(api.getDisplayedRowCount()).toBe(10);
        expect(api.isLastRowIndexKnown()).toBe(true);
        expect(requests).toEqual([
            [0, 10],
            [0, 10],
        ]);
    });

    test('a short refresh response re-derives the count even when the previous count was supplied', async () => {
        const served = { count: 10 };
        const requests: number[][] = [];
        let supplyRowCount = true;
        const allRows = Array.from({ length: 100 }, (_, i) => ({ id: String(i), value: `Row ${i}` }));
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            cacheBlockSize: 10,
            getRowId: (params) => params.data.id,
            serverSideDatasource: {
                getRows: (params: IServerSideGetRowsParams) => {
                    requests.push([params.request.startRow!, params.request.endRow!]);
                    const available = allRows.slice(0, served.count);
                    params.success({
                        rowData: available.slice(params.request.startRow!, params.request.endRow!),
                        rowCount: supplyRowCount ? served.count : undefined,
                    });
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await settle(api);

        // Authoritative: the datasource declared the extent.
        expect(api.getDisplayedRowCount()).toBe(10);
        expect(requests).toEqual([[0, 10]]);

        // The backend has shrunk and stops declaring an extent. A short response is fresh evidence
        // about the data, so it re-derives the count - as it always has, purge or not - and the
        // count it produces is by definition inferred, not the authoritative one it replaced.
        served.count = 3;
        supplyRowCount = false;
        await refreshAndSettle(api);

        expect(api.getDisplayedRowCount()).toBe(3);
        expect(api.isLastRowIndexKnown()).toBe(true);
        expect(!!api.getRowNode('9')).toBe(false);

        // ...which is what lets the next refresh grow the count back. Were the short response
        // treated as authoritative, this would stay latched at 3 - the bug this ticket is about.
        served.count = 10;
        await refreshAndSettle(api);

        expect(api.getDisplayedRowCount()).toBe(10);
        expect(api.isLastRowIndexKnown()).toBe(true);
        expect(!!api.getRowNode('9')).toBe(true);
    });

    test('a count set via api.setRowCount survives a non-purge refresh', async () => {
        const served = { count: 10 };
        const requests: number[][] = [];
        const api = gridsManager.createGrid('myGrid', createGridOptions(served, 10, requests));

        await waitForEvent('firstDataRendered', api);
        await settle(api);

        // Inferred from the short trailing block, so the store probed one block past the data.
        expect(api.getDisplayedRowCount()).toBe(10);
        expect(requests).toEqual([
            [0, 10],
            [10, 20],
        ]);

        // `setRowCount` with no `maxRowFound` sets only the count - but that count comes from the
        // application, so it is authoritative and the refresh must neither drop it nor probe past it.
        api.setRowCount(10);
        await refreshAndSettle(api);

        expect(api.getDisplayedRowCount()).toBe(10);
        expect(api.isLastRowIndexKnown()).toBe(true);
        expect(requests).toEqual([
            [0, 10],
            [10, 20],
            [0, 10],
        ]);
    });
});
