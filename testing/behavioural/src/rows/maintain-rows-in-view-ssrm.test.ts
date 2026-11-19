import { TestGridsManager, waitForEvent } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import { waitForNoLoadingRows } from 'ag-test-utils/ssrm-test-utils';

import type { GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ExternalFilterModule,
    PaginationModule,
    PinnedRowModule,
    RowAutoHeightModule,
    ScrollApiModule,
} from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

interface Row {
    id: string;
    value: number;
    country?: string;
    city?: string;
}

const ROW_HEIGHT = 50;
const SCROLL_TOP = 1000; // row 20 at the top of the viewport

const createRows = (prefix: string, count: number): Row[] =>
    Array.from({ length: count }, (_, i) => ({ id: `${prefix}${i}`, value: i }));

describe('maintaining rows in view with the server-side row model', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            ClientSideRowModelApiModule,
            ServerSideRowModelModule,
            ServerSideRowModelApiModule,
            ScrollApiModule,
            ExternalFilterModule,
            PaginationModule,
            PinnedRowModule,
            RowAutoHeightModule,
            RowGroupingModule,
        ],
    });

    beforeEach(() => {
        // gives the viewport its height, so every row in view is anchored
        mockGridLayout.useRealOffsetDimensions = true;
    });

    afterEach(() => {
        gridsManager.reset();
        mockGridLayout.resetOptions();
    });

    const getViewport = (api: GridApi) =>
        TestGridsManager.getHTMLElement(api)!.querySelector<HTMLElement>('.ag-grid-viewport')!;

    const scrollTo = (api: GridApi, top: number) => {
        getViewport(api).scrollTop = top;
        const { top: viewTop, bottom } = api.getVerticalPixelRange();
        expect(viewTop).toBe(top);
        expect(bottom).toBeGreaterThan(top);
    };

    /** How far the row's top is below the top of the viewport. */
    const offsetInView = (api: GridApi, id: string) => api.getRowNode(id)!.rowTop! - getViewport(api).scrollTop;

    describe('server-side row model', () => {
        const createGrid = async () => {
            const rowData = createRows('r', 60);
            const api = gridsManager.createGrid<Row>('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowModelType: 'serverSide',
                getRowId: ({ data }) => data.id,
                rowHeight: ROW_HEIGHT,
                serverSideDatasource: {
                    getRows: ({ request, success }) =>
                        success({ rowData: rowData.slice(request.startRow, request.endRow), rowCount: rowData.length }),
                },
            });
            await waitForEvent('firstDataRendered', api);
            await waitForNoLoadingRows(api);
            return api;
        };

        /** A grid whose rows are all loaded, so it sorts them on the client after a transaction. */
        const createClientSortedGrid = async () => {
            const rowData = createRows('r', 200);
            const api = gridsManager.createGrid<Row>('myGrid', {
                columnDefs: [{ field: 'value', sort: 'asc' }],
                rowModelType: 'serverSide',
                getRowId: ({ data }) => data.id,
                rowHeight: ROW_HEIGHT,
                serverSideEnableClientSideSort: true,
                cacheBlockSize: rowData.length,
                serverSideDatasource: {
                    getRows: ({ request, success }) =>
                        success({ rowData: rowData.slice(request.startRow, request.endRow), rowCount: rowData.length }),
                },
            });
            await waitForEvent('firstDataRendered', api);
            await waitForNoLoadingRows(api);
            return api;
        };

        test('keeps rows in view when a transaction adds rows above them', async () => {
            const api = await createGrid();
            scrollTo(api, SCROLL_TOP);

            api.applyServerSideTransaction({ add: createRows('new', 3), addIndex: 0 });

            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP + 3 * ROW_HEIGHT);
            expect(offsetInView(api, 'r20')).toBe(0);
        });

        test('moves the focused cell with its row when the row is loaded but not rendered', async () => {
            const api = await createGrid();
            api.setFocusedCell(55, 'value');

            api.applyServerSideTransaction({ add: createRows('new', 3), addIndex: 0 });

            expect(api.getFocusedCell()?.rowIndex).toBe(58);
        });

        test('keeps rows in view when a transaction removes rows above them', async () => {
            const api = await createGrid();
            scrollTo(api, SCROLL_TOP);

            api.applyServerSideTransaction({ remove: [{ id: 'r0' }, { id: 'r1' }] as Row[] });

            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP - 2 * ROW_HEIGHT);
            expect(offsetInView(api, 'r20')).toBe(0);
        });

        test('keeps the row after the rows in view removed in view, as with client-side rows', async () => {
            const api = await createGrid();
            scrollTo(api, SCROLL_TOP);

            api.applyServerSideTransaction({ remove: [{ id: 'r0' }, { id: 'r20' }, { id: 'r21' }] as Row[] });

            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP - 2 * ROW_HEIGHT);
            expect(offsetInView(api, 'r22')).toBe(ROW_HEIGHT);
        });

        test('keeps rows in view when async transactions add rows above them', async () => {
            const api = await createGrid();
            scrollTo(api, SCROLL_TOP);

            api.applyServerSideTransactionAsync({ add: createRows('new', 2), addIndex: 0 });
            api.flushServerSideAsyncTransactions();

            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP + 2 * ROW_HEIGHT);
            expect(offsetInView(api, 'r20')).toBe(0);
        });

        test('keeps rows in view when a row added above them is evicted from the cache', async () => {
            const rowData = createRows('r', 200);
            const api = gridsManager.createGrid<Row>('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowModelType: 'serverSide',
                getRowId: ({ data }) => data.id,
                rowHeight: ROW_HEIGHT,
                suppressRowVirtualisation: false,
                cacheBlockSize: 50,
                maxBlocksInCache: 1,
                serverSideDatasource: {
                    getRows: ({ request, success }) =>
                        success({ rowData: rowData.slice(request.startRow, request.endRow), rowCount: rowData.length }),
                },
            });
            await waitForEvent('firstDataRendered', api);
            scrollTo(api, 60 * ROW_HEIGHT);
            await waitForNoLoadingRows(api);
            expect(api.getRowNode('r0')).toBeUndefined(); // the first block is evicted

            api.applyServerSideTransaction({ add: [{ id: 'new', value: -1 }], addIndex: 0 });

            expect(getViewport(api).scrollTop).toBe(61 * ROW_HEIGHT);
            expect(offsetInView(api, 'r60')).toBe(0);
        });

        test('keeps rows in view when a transaction removes an expanded group whose rows are not all loaded', async () => {
            const leaves = (country: string) =>
                Array.from({ length: 1000 }, (_, i) => ({ id: `${country}${i}`, value: i, country }));
            const groups: Record<string, Row[]> = { A: leaves('A'), B: leaves('B') };
            const api = gridsManager.createGrid<Row>('myGrid', {
                columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'value' }],
                rowModelType: 'serverSide',
                getRowId: ({ data }) => data.id ?? data.country!,
                rowHeight: ROW_HEIGHT,
                suppressRowVirtualisation: false,
                cacheBlockSize: 100,
                isServerSideGroupOpenByDefault: () => true,
                serverSideDatasource: {
                    getRows: ({ request, success }) => {
                        const [country] = request.groupKeys;
                        const rows = country ? groups[country] : Object.keys(groups).map((key) => ({ country: key }));
                        success({ rowData: rows.slice(request.startRow, request.endRow), rowCount: rows.length });
                    },
                },
            });
            await waitForEvent('firstDataRendered', api);
            // in group B, with most of group A never loaded
            const scrollTop = 1050 * ROW_HEIGHT;
            scrollTo(api, scrollTop);
            await waitForNoLoadingRows(api);
            expect(api.getRowNode('A500')).toBeUndefined();
            const offset = offsetInView(api, 'B50');

            api.applyServerSideTransaction({ route: [], remove: [{ country: 'A' }] as Row[] });

            expect(getViewport(api).scrollTop).toBe(scrollTop - 1001 * ROW_HEIGHT);
            expect(offsetInView(api, 'B50')).toBe(offset);
        });

        test('keeps the rows after a removed group in view when the group contains every row in view', async () => {
            const leaves = (country: string) =>
                Array.from({ length: 1000 }, (_, i) => ({ id: `${country}${i}`, value: i, country }));
            const groups: Record<string, Row[]> = { A: leaves('A'), B: leaves('B') };
            const api = gridsManager.createGrid<Row>('myGrid', {
                columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'value' }],
                rowModelType: 'serverSide',
                getRowId: ({ data }) => data.id ?? data.country!,
                rowHeight: ROW_HEIGHT,
                suppressRowVirtualisation: false,
                cacheBlockSize: 100,
                isServerSideGroupOpenByDefault: () => true,
                serverSideDatasource: {
                    getRows: ({ request, success }) => {
                        const [country] = request.groupKeys;
                        const rows = country ? groups[country] : Object.keys(groups).map((key) => ({ country: key }));
                        success({ rowData: rows.slice(request.startRow, request.endRow), rowCount: rows.length });
                    },
                },
            });
            await waitForEvent('firstDataRendered', api);
            // halfway through group A, with most of it never loaded
            scrollTo(api, 500 * ROW_HEIGHT);
            await waitForNoLoadingRows(api);
            expect(api.getRowNode('A800')).toBeUndefined();

            api.applyServerSideTransaction({ route: [], remove: [{ country: 'A' }] as Row[] });

            expect(getViewport(api).scrollTop).toBe(0);
            expect(api.getDisplayedRowAtIndex(0)!.id).toBe('B');
        });

        test('keeps the next row in view when an update sorts the top row in view elsewhere on the client', async () => {
            const api = await createClientSortedGrid();
            scrollTo(api, SCROLL_TOP);

            api.applyServerSideTransaction({ update: [{ id: 'r20', value: 1000 }] });

            expect(api.getDisplayedRowAtIndex(199)!.id).toBe('r20');
            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP - ROW_HEIGHT);
            expect(offsetInView(api, 'r21')).toBe(ROW_HEIGHT);
        });

        test('keeps rows in view when the same update adds rows above them and sorts rows above them elsewhere on the client', async () => {
            const api = await createClientSortedGrid();
            scrollTo(api, SCROLL_TOP);

            api.applyServerSideTransaction({
                add: createRows('new', 3).map((row) => ({ ...row, value: -1 })),
                update: [{ id: 'r19', value: 1000 }],
            });

            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP + 2 * ROW_HEIGHT);
            expect(offsetInView(api, 'r20')).toBe(0);
        });

        test('keeps rows in view when an update sorted on the client adds an unbalanced group above them', async () => {
            const groups = Array.from({ length: 200 }, (_, i) => ({ country: `c${String(i).padStart(3, '0')}` }));
            const api = gridsManager.createGrid<Row>('myGrid', {
                columnDefs: [{ field: 'country', rowGroup: true, hide: true, sort: 'asc' }, { field: 'value' }],
                rowModelType: 'serverSide',
                getRowId: ({ data }) => data.id ?? data.country!,
                rowHeight: ROW_HEIGHT,
                serverSideEnableClientSideSort: true,
                groupAllowUnbalanced: true,
                cacheBlockSize: groups.length,
                serverSideDatasource: {
                    getRows: ({ request, success }) => {
                        const rows = request.groupKeys.length ? [{ id: 'leaf', value: 0, country: '' }] : groups;
                        success({ rowData: rows.slice(request.startRow, request.endRow), rowCount: rows.length });
                    },
                },
            });
            await waitForEvent('firstDataRendered', api);
            await waitForNoLoadingRows(api);
            scrollTo(api, SCROLL_TOP);

            // the unbalanced group is hidden, and its one row is not loaded yet
            api.applyServerSideTransaction({ route: [], add: [{ country: '' }] as Row[] });

            expect(api.getDisplayedRowAtIndex(0)!.stub).toBe(true);
            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP + ROW_HEIGHT);
            expect(offsetInView(api, 'c020')).toBe(0);
        });
    });
});
