import { TestGridsManager, waitForEvent } from 'ag-test-utils';

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

    function createOptions(getRows: () => (typeof allRows)[number][], cacheBlockSize: number): GridOptions {
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
                    params.success({ rowData: rows, rowCount: rows.length });
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
        const api = gridsManager.createGrid(
            'myGrid',
            createOptions(() => rows, 10)
        );
        await waitForEvent('firstDataRendered', api);
        expect(api.getDisplayedRowCount()).toBe(20);

        rows = [...allRows.slice(9), ...allRows.slice(0, 9)];
        const refreshed = waitForEvent('storeRefreshed', api);
        api.refreshServerSide({ purge: false });
        await refreshed;

        expect(fadedRowIds(api)).toEqual([]);
        expect(api.getDisplayedRowCount()).toBe(20);
        expect(api.getRowNode('r00')).toBeDefined();
        expect(displayedRowIds(api)).toEqual(rows.map((r) => r.id));
    });
});
