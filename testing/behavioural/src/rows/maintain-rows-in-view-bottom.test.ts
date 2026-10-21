import { TestGridsManager, waitForEvent } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import { waitForNoLoadingRows } from 'ag-test-utils/ssrm-test-utils';

import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    PaginationModule,
    ScrollApiModule,
} from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

interface Row {
    id: string;
    value: number;
}

const ROW_HEIGHT = 50;

const createRows = (prefix: string, count: number): Row[] =>
    Array.from({ length: count }, (_, i) => ({ id: `${prefix}${i}`, value: i }));

describe('maintainRowsInViewOnDataUpdate at the bottom of the rows', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            ClientSideRowModelApiModule,
            ServerSideRowModelModule,
            ServerSideRowModelApiModule,
            ScrollApiModule,
            PaginationModule,
        ],
    });

    beforeEach(() => {
        // gives the viewport its height, so it has a bottom to scroll to
        mockGridLayout.useRealOffsetDimensions = true;
    });

    afterEach(() => {
        gridsManager.reset();
        mockGridLayout.resetOptions();
    });

    const getViewport = (api: GridApi) =>
        TestGridsManager.getHTMLElement(api)!.querySelector<HTMLElement>('.ag-grid-viewport')!;

    /** The scroll position with the last row at the bottom of the viewport. */
    const getMaxScrollTop = (api: GridApi) => {
        const { scrollHeight, clientHeight } = getViewport(api);
        return scrollHeight - clientHeight;
    };

    const scrollTo = (api: GridApi, top: number) => {
        getViewport(api).scrollTop = top;
        expect(api.getVerticalPixelRange().top).toBe(top);
    };

    const scrollToBottom = (api: GridApi) => {
        const maxScrollTop = getMaxScrollTop(api);
        expect(maxScrollTop).toBeGreaterThan(0);
        scrollTo(api, maxScrollTop);
        return maxScrollTop;
    };

    describe('client-side row model', () => {
        const createGrid = (options?: GridOptions<Row>) =>
            gridsManager.createGrid<Row>('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowData: createRows('r', 200),
                getRowId: ({ data }) => data.id,
                rowHeight: ROW_HEIGHT,
                maintainRowsInViewOnDataUpdate: true,
                ...options,
            });

        test('stays at the bottom when rows are added at the end, so they come into view', () => {
            const api = createGrid();
            const bottom = scrollToBottom(api);

            api.applyTransaction({ add: createRows('new', 3) });

            expect(getViewport(api).scrollTop).toBe(bottom + 3 * ROW_HEIGHT);
            expect(getViewport(api).scrollTop).toBe(getMaxScrollTop(api));
        });

        test('stays at the bottom when rows are added above the rows in view', () => {
            const api = createGrid();
            const bottom = scrollToBottom(api);

            api.applyTransaction({ add: createRows('new', 3), addIndex: 0 });

            expect(getViewport(api).scrollTop).toBe(bottom + 3 * ROW_HEIGHT);
            expect(getViewport(api).scrollTop).toBe(getMaxScrollTop(api));
        });

        test('stays at the bottom when the same update adds rows above the rows in view and at the end', () => {
            const api = createGrid();
            const bottom = scrollToBottom(api);

            api.setGridOption('rowData', [...createRows('above', 2), ...createRows('r', 200), ...createRows('end', 3)]);

            expect(getViewport(api).scrollTop).toBe(bottom + 5 * ROW_HEIGHT);
        });

        test('stays at the bottom when rows are removed above the rows in view', () => {
            const api = createGrid();
            const bottom = scrollToBottom(api);

            api.applyTransaction({ remove: [{ id: 'r0' }, { id: 'r1' }] as Row[] });

            expect(getViewport(api).scrollTop).toBe(bottom - 2 * ROW_HEIGHT);
            expect(getViewport(api).scrollTop).toBe(getMaxScrollTop(api));
        });

        test('stays at the bottom when async transactions add rows at the end', async () => {
            const api = createGrid();
            const bottom = scrollToBottom(api);

            api.applyTransactionAsync({ add: createRows('a', 2) });
            api.applyTransactionAsync({ add: createRows('b', 1) });
            await waitForEvent('asyncTransactionsFlushed', api);

            expect(getViewport(api).scrollTop).toBe(bottom + 3 * ROW_HEIGHT);
        });

        test('stays at the bottom with variable row heights', () => {
            const api = createGrid({
                getRowHeight: ({ data }) => (data?.id.startsWith('new') ? 2 * ROW_HEIGHT : ROW_HEIGHT),
            });
            const bottom = scrollToBottom(api);

            api.applyTransaction({ add: createRows('new', 3) });

            expect(getViewport(api).scrollTop).toBe(bottom + 6 * ROW_HEIGHT);
        });

        test('keeps the rows in view when near but not at the bottom', () => {
            const api = createGrid();
            const nearBottom = getMaxScrollTop(api) - 10;
            scrollTo(api, nearBottom);

            api.applyTransaction({ add: createRows('new', 3) });

            expect(getViewport(api).scrollTop).toBe(nearBottom);
        });

        test('does not scroll when the rows fit in the viewport, as it is also at the top', () => {
            const api = createGrid({ rowData: createRows('r', 2) });

            api.applyTransaction({ add: createRows('new', 50) });

            expect(getViewport(api).scrollTop).toBe(0);
        });

        test('stays at the bottom of the current page', () => {
            const api = createGrid({ pagination: true, paginationPageSize: 100 });
            const bottom = scrollToBottom(api);

            api.applyTransaction({ add: createRows('new', 3), addIndex: 0 });

            expect(getViewport(api).scrollTop).toBe(bottom);
            expect(getViewport(api).scrollTop).toBe(getMaxScrollTop(api));
        });

        test('does not stay at the bottom when the option is off', () => {
            const api = createGrid({ maintainRowsInViewOnDataUpdate: undefined });
            const bottom = scrollToBottom(api);

            api.applyTransaction({ add: createRows('new', 3) });

            expect(getViewport(api).scrollTop).toBe(bottom);
            expect(getMaxScrollTop(api)).toBe(bottom + 3 * ROW_HEIGHT);
        });
    });

    describe('server-side row model', () => {
        test('stays at the bottom when a transaction adds rows at the end and the row count grows', async () => {
            const rowData = createRows('r', 60);
            const api = gridsManager.createGrid<Row>('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowModelType: 'serverSide',
                getRowId: ({ data }) => data.id,
                rowHeight: ROW_HEIGHT,
                maintainRowsInViewOnDataUpdate: true,
                serverSideDatasource: {
                    getRows: ({ request, success }) =>
                        success({ rowData: rowData.slice(request.startRow, request.endRow), rowCount: rowData.length }),
                },
            });
            await waitForEvent('firstDataRendered', api);
            await waitForNoLoadingRows(api);
            const bottom = scrollToBottom(api);
            await waitForNoLoadingRows(api);

            api.applyServerSideTransaction({ add: createRows('new', 3) });

            expect(api.getDisplayedRowCount()).toBe(63);
            expect(getViewport(api).scrollTop).toBe(bottom + 3 * ROW_HEIGHT);
            expect(getViewport(api).scrollTop).toBe(getMaxScrollTop(api));
        });
    });
});
