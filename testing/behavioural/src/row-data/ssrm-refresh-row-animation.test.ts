import { TestGridsManager, waitForEvent, waitForNoLoadingRows } from 'ag-test-utils';

import type { GridApi, GridOptions, IServerSideGetRowsParams } from 'ag-grid-community';
import { ScrollApiModule, getGridElement } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

describe('SSRM soft refresh row animation', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ScrollApiModule, ServerSideRowModelModule],
    });

    afterEach(() => gridsManager.reset());

    const allRows = Array.from({ length: 20 }, (_, i) => ({ id: `r${String(i).padStart(2, '0')}`, value: i }));

    function fadedRowIds(api: GridApi): string[] {
        const element = getGridElement(api)!;
        const ids = [...element.querySelectorAll('[row-id].ag-opacity-zero')].map((el) => el.getAttribute('row-id')!);
        return [...new Set(ids)].sort();
    }

    function displayedRowIds(api: GridApi): (string | undefined)[] {
        return Array.from({ length: api.getDisplayedRowCount() }, (_, i) => api.getDisplayedRowAtIndex(i)?.id);
    }

    function createOptions(
        getRows: () => (typeof allRows)[number][],
        cacheBlockSize: number,
        requests: [number, number][] = []
    ): GridOptions {
        return {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            getRowId: (params) => params.data.id,
            animateRows: true,
            // _isAnimateRows() returns false whenever ensureDomOrder is truthy, and
            // TestGridsManager defaults it to true — without this no animation runs at all.
            ensureDomOrder: false,
            rowHeight: 24,
            cacheBlockSize,
            serverSideDatasource: {
                getRows: (params: IServerSideGetRowsParams) => {
                    const rows = getRows();
                    // Serve only the requested block. Returning the whole dataset regardless of the
                    // range would let a single response populate every block, so a multi-block
                    // refresh would never span two responses.
                    const startRow = params.request.startRow ?? 0;
                    const endRow = params.request.endRow ?? rows.length;
                    requests.push([startRow, endRow]);
                    params.success({ rowData: rows.slice(startRow, endRow), rowCount: rows.length });
                },
            },
        };
    }

    test('rows past the new store end fade out rather than being repositioned', async () => {
        let rows = allRows;
        const api = gridsManager.createGrid(
            'myGrid',
            createOptions(() => rows, 100)
        );
        await waitForEvent('firstDataRendered', api);
        expect(api.getDisplayedRowCount()).toBe(20);

        rows = allRows.slice(0, 9);
        const refreshed = waitForEvent('storeRefreshed', api);
        api.refreshServerSide({ purge: false });
        await refreshed;

        expect(api.getDisplayedRowCount()).toBe(9);
        expect(fadedRowIds(api)).toEqual(allRows.slice(9).map((r) => r.id));
    });

    test('a row deleted from the middle fades out rather than being repositioned', async () => {
        let rows = allRows;
        const api = gridsManager.createGrid(
            'myGrid',
            createOptions(() => rows, 100)
        );
        await waitForEvent('firstDataRendered', api);

        rows = allRows.filter((row) => row.id !== 'r03');
        const refreshed = waitForEvent('storeRefreshed', api);
        api.refreshServerSide({ purge: false });
        await refreshed;

        expect(api.getDisplayedRowCount()).toBe(19);
        expect(fadedRowIds(api)).toEqual(['r03']);
        expect(displayedRowIds(api)).toEqual(rows.map((row) => row.id));
    });

    test('a row deleted from an earlier block fades out while a later block is still refreshing', async () => {
        let rows = allRows;
        const requests: [number, number][] = [];
        const api = gridsManager.createGrid(
            'myGrid',
            createOptions(() => rows, 10, requests)
        );
        await waitForEvent('firstDataRendered', api);

        // Pull the second block in, so the refresh below spans two responses and the deleted node is
        // parked while the second block's response is still outstanding.
        displayedRowIds(api);
        await waitForNoLoadingRows(api);
        expect(api.getDisplayedRowCount()).toBe(20);

        requests.length = 0;
        rows = allRows.filter((row) => row.id !== 'r03');
        const refreshed = waitForEvent('storeRefreshed', api);
        api.refreshServerSide({ purge: false });
        await refreshed;
        await waitForNoLoadingRows(api);

        expect(requests).toEqual([
            [0, 10],
            [10, 20],
        ]);
        expect(api.getDisplayedRowCount()).toBe(19);
        // r03 is the deleted row. r19 shifted out of the second block into the first, so the redraw
        // between the two responses discarded its old row controller — see the boundary-cross case
        // below for why that discarded duplicate fades too.
        expect(fadedRowIds(api)).toEqual(['r03', 'r19']);
        expect(displayedRowIds(api)).toEqual(rows.map((row) => row.id));
    });

    test('a soft refresh that reorders rows animates the move and fades nothing', async () => {
        let rows = allRows;
        const api = gridsManager.createGrid(
            'myGrid',
            createOptions(() => rows, 100)
        );
        await waitForEvent('firstDataRendered', api);

        rows = [...allRows.slice(9), ...allRows.slice(0, 9)];
        const refreshed = waitForEvent('storeRefreshed', api);
        api.refreshServerSide({ purge: false });
        await refreshed;

        expect(fadedRowIds(api)).toEqual([]);
        expect(api.getDisplayedRowCount()).toBe(20);
        expect(api.getRowNode('r00')).toBeDefined();
        expect(api.getRowNode('r19')).toBeDefined();
        expect(displayedRowIds(api)).toEqual(rows.map((r) => r.id));
    });

    test('a multi-block soft refresh that reorders across the block boundary still animates the move', async () => {
        let rows = allRows;
        const requests: [number, number][] = [];
        const api = gridsManager.createGrid(
            'myGrid',
            createOptions(() => rows, 10, requests)
        );
        await waitForEvent('firstDataRendered', api);
        expect(api.getDisplayedRowCount()).toBe(20);

        // Pull the second block in, so the refresh below genuinely spans two responses — the case
        // that exercises retaining a parked node between them.
        displayedRowIds(api);
        await waitForNoLoadingRows(api);
        expect(requests).toEqual([
            [0, 10],
            [10, 20],
        ]);

        requests.length = 0;
        rows = [...allRows.slice(9), ...allRows.slice(0, 9)];
        const refreshed = waitForEvent('storeRefreshed', api);
        api.refreshServerSide({ purge: false });
        await refreshed;
        await waitForNoLoadingRows(api);

        // Both blocks were refreshed by separate responses, so nodes moving across the boundary
        // were parked while the second was still outstanding.
        expect(requests).toEqual([
            [0, 10],
            [10, 20],
        ]);
        // The nine rows crossing the boundary are parked while the second block's response is
        // outstanding, so the redraw in between discards their old row controllers. Those discarded
        // duplicates fade out rather than standing at full opacity until they vanish.
        expect(fadedRowIds(api)).toEqual(allRows.slice(0, 9).map((r) => r.id));
        expect(api.getDisplayedRowCount()).toBe(20);
        expect(api.getRowNode('r00')).toBeDefined();
        expect(displayedRowIds(api)).toEqual(rows.map((r) => r.id));
        // The rows themselves still slide from where they were rather than fading back in:
        // oldRowTop is the pre-refresh position the move animates from.
        expect(api.getRowNode('r00')!.oldRowTop).toBe(0);
        expect(api.getRowNode('r00')!.rowTop).toBe(11 * 24);
    });
});
