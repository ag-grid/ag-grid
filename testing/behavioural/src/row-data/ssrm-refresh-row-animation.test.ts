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

    test('a multi-block soft refresh that reorders across the block boundary fades nothing', async () => {
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
        expect(fadedRowIds(api)).toEqual([]);
        expect(api.getDisplayedRowCount()).toBe(20);
        expect(api.getRowNode('r00')).toBeDefined();
        expect(displayedRowIds(api)).toEqual(rows.map((r) => r.id));
    });
});
