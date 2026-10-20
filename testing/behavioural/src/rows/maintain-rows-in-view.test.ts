import { waitFor } from '@testing-library/dom';
import { TestGridsManager, nextAnimationFrame, waitForEvent } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import { waitForNoLoadingRows } from 'ag-test-utils/ssrm-test-utils';

import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ExternalFilterModule,
    PaginationModule,
    PinnedRowModule,
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

describe('maintainRowsInViewOnDataUpdate', () => {
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

        test('is off by default', () => {
            const api = createGrid({ maintainRowsInViewOnDataUpdate: undefined });
            expect(api.getGridOption('maintainRowsInViewOnDataUpdate')).toBe(false);
            scrollTo(api, SCROLL_TOP);

            api.applyTransaction({ add: createRows('new', 3), addIndex: 0 });

            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP);
            expect(offsetInView(api, 'r20')).toBe(3 * ROW_HEIGHT);

            api.setGridOption('rowData', [...createRows('row', 2), ...createRows('new', 3), ...createRows('r', 200)]);

            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP);
            expect(offsetInView(api, 'r20')).toBe(5 * ROW_HEIGHT);
        });

        test('keeps rows in view when a transaction adds rows above them', () => {
            const api = createGrid();
            scrollTo(api, SCROLL_TOP + 10);

            api.applyTransaction({ add: createRows('new', 3), addIndex: 0 });

            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP + 10 + 3 * ROW_HEIGHT);
            expect(offsetInView(api, 'r20')).toBe(-10);
        });

        test('keeps rows in view when a transaction removes rows above them', () => {
            const api = createGrid();
            scrollTo(api, SCROLL_TOP);

            api.applyTransaction({ remove: [{ id: 'r0' }, { id: 'r5' }] as Row[] });

            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP - 2 * ROW_HEIGHT);
            expect(offsetInView(api, 'r20')).toBe(0);
        });

        test('keeps the next row in view when the top row in view is removed', () => {
            const api = createGrid();
            scrollTo(api, SCROLL_TOP);

            api.applyTransaction({ remove: [{ id: 'r0' }, { id: 'r20' }] as Row[] });

            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP - 2 * ROW_HEIGHT);
            expect(offsetInView(api, 'r21')).toBe(ROW_HEIGHT);
        });

        test('keeps the row after the rows in view removed in view', () => {
            const api = createGrid();
            scrollTo(api, SCROLL_TOP);

            api.applyTransaction({ remove: [{ id: 'r0' }, { id: 'r20' }, { id: 'r21' }] as Row[] });

            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP - 2 * ROW_HEIGHT);
            expect(offsetInView(api, 'r22')).toBe(ROW_HEIGHT);
        });

        test('keeps the rows after the rows in view in view when every row in view is removed', () => {
            const api = createGrid();
            scrollTo(api, SCROLL_TOP + 10);

            api.applyTransaction({ remove: createRows('r', 40) });

            expect(getViewport(api).scrollTop).toBe(0);
            expect(api.getDisplayedRowAtIndex(0)!.id).toBe('r40');
        });

        test.each([
            ['added', (api: GridApi) => api.applyTransaction({ add: createRows('new', 2), addIndex: 0 }), 2],
            ['removed', (api: GridApi) => api.applyTransaction({ remove: [{ id: 'r0' }] as Row[] }), -1],
        ])('keeps rows in view when rows are %s before the page', (_, update, rowsAdded) => {
            const api = createGrid({ pagination: true, paginationPageSize: 100, paginationPageSizeSelector: false });
            api.paginationGoToPage(1);
            scrollTo(api, SCROLL_TOP);
            const offsetInPage = (id: string) =>
                api.getRowNode(id)!.rowTop! - api.getDisplayedRowAtIndex(100)!.rowTop! - getViewport(api).scrollTop;
            expect(offsetInPage('r120')).toBe(0);

            update(api);

            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP + rowsAdded * ROW_HEIGHT);
            expect(offsetInPage('r120')).toBe(0);
        });

        test('keeps rows in view at the top of a later page when rows are added on an earlier page', () => {
            const api = createGrid({ pagination: true, paginationPageSize: 100, paginationPageSizeSelector: false });
            api.paginationGoToPage(1);
            expect(getViewport(api).scrollTop).toBe(0);
            expect(api.getDisplayedRowAtIndex(100)!.id).toBe('r100');

            api.applyTransaction({ add: createRows('new', 2), addIndex: 0 });

            expect(getViewport(api).scrollTop).toBe(2 * ROW_HEIGHT);
            expect(api.getRowNode('r100')!.rowTop! - api.getDisplayedRowAtIndex(100)!.rowTop!).toBe(2 * ROW_HEIGHT);
        });

        test('does not scroll when row data without row IDs replaces every row', () => {
            const api = createGrid({ getRowId: undefined, suppressScrollOnNewData: true });
            scrollTo(api, SCROLL_TOP);

            api.setGridOption('rowData', createRows('r', 200));

            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP);
        });

        test('does not scroll when a row pinned from below the rows in view is removed', async () => {
            const api = createGrid({
                enableRowPinning: true,
                isRowPinned: (node) => (node.data?.id === 'r150' ? 'top' : null),
            });
            await waitFor(() => expect(api.getPinnedTopRowCount()).toBe(1));
            scrollTo(api, SCROLL_TOP);

            api.applyTransaction({ remove: [{ id: 'r150' }] as Row[] });

            expect(api.getPinnedTopRowCount()).toBe(0);
            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP);
        });

        test('keeps rows in view when rows removed above them include a pinned row', async () => {
            const api = createGrid({
                enableRowPinning: true,
                isRowPinned: (node) => (node.data?.id === 'r0' ? 'top' : null),
            });
            await waitFor(() => expect(api.getPinnedTopRowCount()).toBe(1));
            scrollTo(api, SCROLL_TOP);
            const offset = offsetInView(api, 'r20');

            api.applyTransaction({ remove: createRows('r', 5) });

            expect(api.getPinnedTopRowCount()).toBe(0);
            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP - 5 * ROW_HEIGHT);
            expect(offsetInView(api, 'r20')).toBe(offset);
        });

        test('does not scroll when rows are added below the rows in view', () => {
            const api = createGrid();
            scrollTo(api, SCROLL_TOP);

            api.applyTransaction({ add: createRows('new', 3), addIndex: 150 });

            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP);
        });

        test('shows rows added at the top while scrolled to the top', () => {
            const api = createGrid();

            api.applyTransaction({ add: createRows('new', 3), addIndex: 0 });

            expect(getViewport(api).scrollTop).toBe(0);
            expect(api.getDisplayedRowAtIndex(0)!.id).toBe('new0');
        });

        test('keeps rows in view when async transactions add rows above them', async () => {
            const api = createGrid();
            scrollTo(api, SCROLL_TOP);

            api.applyTransactionAsync({ add: createRows('a', 2), addIndex: 0 });
            api.applyTransactionAsync({ add: createRows('b', 1), addIndex: 0 });
            await waitForEvent('asyncTransactionsFlushed', api);

            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP + 3 * ROW_HEIGHT);
            expect(offsetInView(api, 'r20')).toBe(0);
        });

        test('keeps rows in view when flushing async transactions', () => {
            const api = createGrid();
            scrollTo(api, SCROLL_TOP);

            api.applyTransactionAsync({ add: createRows('a', 2), addIndex: 0 });
            api.flushAsyncTransactions();

            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP + 2 * ROW_HEIGHT);
            expect(offsetInView(api, 'r20')).toBe(0);
        });

        test('keeps rows in view when updated row data adds rows above them', () => {
            const api = createGrid();
            scrollTo(api, SCROLL_TOP);

            api.setGridOption('rowData', [...createRows('new', 4), ...createRows('r', 200).slice(1)]);

            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP + 3 * ROW_HEIGHT);
            expect(offsetInView(api, 'r20')).toBe(0);
        });

        test('keeps rows in view with variable row heights', () => {
            const api = createGrid({
                getRowHeight: ({ data }) => (data?.id.startsWith('new') ? 80 : 20 + (data!.value % 3) * 10),
            });
            scrollTo(api, SCROLL_TOP);
            const offset = offsetInView(api, 'r40');

            api.applyTransaction({ add: createRows('new', 2), addIndex: 0, remove: [{ id: 'r1' }] as Row[] });

            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP + 2 * 80 - 30);
            expect(offsetInView(api, 'r40')).toBe(offset);
        });

        test('keeps the top row in view where it was when rows above it are positioned with estimated heights', () => {
            const api = createGrid({
                getRowHeight: ({ data }) => (data?.id.startsWith('new') ? 80 : ROW_HEIGHT),
                suppressRowVirtualisation: false, // rows that are not rendered keep their estimated heights
            });
            scrollTo(api, SCROLL_TOP * 5);
            let rowInView = '';
            api.forEachNode(({ id, rowTop, rowHeight }) => {
                if (rowTop! <= SCROLL_TOP * 5 && SCROLL_TOP * 5 < rowTop! + rowHeight!) {
                    rowInView = id!;
                }
            });
            const offset = offsetInView(api, rowInView);

            api.applyTransaction({ add: createRows('new', 2), addIndex: 0 });

            // the rows are followed to where they are drawn, as the estimated heights above them resolve
            expect([api.getRowNode('new0')!.rowHeight, api.getRowNode('new1')!.rowHeight]).not.toContain(80);
            expect(offsetInView(api, rowInView)).toBe(offset);
        });

        test.each([false, true])(
            'keeps rows in view without animating them when animateRows is enabled (suppressAnimationFrame=%s)',
            async (suppressAnimationFrame) => {
                const api = createGrid({ animateRows: true, ensureDomOrder: false, suppressAnimationFrame });
                const root = TestGridsManager.getHTMLElement(api)!;
                await nextAnimationFrame();
                scrollTo(api, SCROLL_TOP);
                const isRowAnimationPrevented = () => !!root.querySelector('.ag-prevent-animation');
                // as in a browser, so the scroll the grid makes while drawing rows is handled after it has finished
                mockGridLayout.asyncScrollEvents = true;

                api.applyTransaction({ add: createRows('new', 3), addIndex: 0 });

                expect(getViewport(api).scrollTop).toBe(SCROLL_TOP + 3 * ROW_HEIGHT);
                expect(root.querySelector<HTMLElement>('[row-id="r20"]')!.style.transform).toBe(
                    `translateY(${SCROLL_TOP + 3 * ROW_HEIGHT}px)`
                );
                expect(isRowAnimationPrevented()).toBe(true);

                await nextAnimationFrame();
                await nextAnimationFrame();
                expect(isRowAnimationPrevented()).toBe(false);
            }
        );

        test('keeps the next row in view when an update sorts the top row in view elsewhere, as when it is removed', () => {
            const api = createGrid({ columnDefs: [{ field: 'value', sort: 'asc' }] });
            scrollTo(api, SCROLL_TOP);

            api.applyTransaction({ update: [{ id: 'r20', value: 1000 }] });

            expect(api.getDisplayedRowAtIndex(199)!.id).toBe('r20');
            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP - ROW_HEIGHT);
            expect(offsetInView(api, 'r21')).toBe(ROW_HEIGHT);
        });

        test('does not scroll when an update sorts a row in view below the top row elsewhere, as when it is removed', () => {
            const api = createGrid({ columnDefs: [{ field: 'value', sort: 'asc' }] });
            scrollTo(api, SCROLL_TOP);

            api.applyTransaction({ update: [{ id: 'r21', value: 1000 }] });

            expect(api.getDisplayedRowAtIndex(199)!.id).toBe('r21');
            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP);
            expect(offsetInView(api, 'r20')).toBe(0);
        });

        test('follows the rows in view when an update sorts them elsewhere', () => {
            const api = createGrid({ columnDefs: [{ field: 'value', sort: 'asc' }] });
            scrollTo(api, SCROLL_TOP);
            const update = createRows('r', 200)
                .slice(20, 40)
                .map((row) => ({ ...row, value: row.value + 1000 }));

            api.applyTransaction({ update });

            expect(api.getDisplayedRowAtIndex(180)!.id).toBe('r20');
            expect(getViewport(api).scrollTop).toBe(180 * ROW_HEIGHT);
            expect(offsetInView(api, 'r20')).toBe(0);
        });

        test('follows the rows in view when an update sorts them elsewhere with the rows above them', () => {
            const api = createGrid({ columnDefs: [{ field: 'value', sort: 'asc' }] });
            scrollTo(api, SCROLL_TOP);
            const update = createRows('r', 200)
                .slice(0, 100)
                .map((row) => ({ ...row, value: row.value + 1000 }));

            api.applyTransaction({ update });

            expect(api.getDisplayedRowAtIndex(0)!.id).toBe('r100');
            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP + 100 * ROW_HEIGHT);
            expect(offsetInView(api, 'r20')).toBe(0);
        });

        test('does not scroll when an update re-sorts the rows in view among themselves', () => {
            const api = createGrid({ columnDefs: [{ field: 'value', sort: 'asc' }] });
            scrollTo(api, SCROLL_TOP);
            const update = createRows('r', 200)
                .slice(20, 30)
                .map((row) => ({ ...row, value: 49 - row.value }));

            api.applyTransaction({ update });

            expect(api.getDisplayedRowAtIndex(29)!.id).toBe('r20');
            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP);
        });

        test('keeps rows in view when updated row data sorts rows above them elsewhere', () => {
            const api = createGrid({ columnDefs: [{ field: 'value', sort: 'asc' }] });
            scrollTo(api, SCROLL_TOP);

            api.setGridOption(
                'rowData',
                createRows('r', 200).map((row) => (row.value < 5 ? { ...row, value: row.value + 1000 } : row))
            );

            expect(api.getDisplayedRowAtIndex(0)!.id).toBe('r5');
            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP - 5 * ROW_HEIGHT);
            expect(offsetInView(api, 'r20')).toBe(0);
        });

        test('keeps rows in view when an update filters out rows above them', () => {
            const api = createGrid({
                isExternalFilterPresent: () => true,
                doesExternalFilterPass: ({ data }) => data!.value < 1000,
            });
            scrollTo(api, SCROLL_TOP);

            api.applyTransaction({
                update: [
                    { id: 'r0', value: 1000 },
                    { id: 'r1', value: 1001 },
                ],
            });

            expect(api.getDisplayedRowAtIndex(0)!.id).toBe('r2');
            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP - 2 * ROW_HEIGHT);
            expect(offsetInView(api, 'r20')).toBe(0);
        });

        test('keeps the top rows in view when the same update filters out rows above them and adds a row between them', () => {
            const api = createGrid({
                columnDefs: [{ field: 'value', sort: 'asc' }],
                isExternalFilterPresent: () => true,
                doesExternalFilterPass: ({ data }) => data!.value < 1000,
            });
            scrollTo(api, SCROLL_TOP);
            const update = createRows('r', 10).map((row) => ({ ...row, value: row.value + 1000 }));

            api.applyTransaction({ add: [{ id: 'new', value: 24.5 }], update });

            expect(api.getDisplayedRowAtIndex(0)!.id).toBe('r10');
            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP - 10 * ROW_HEIGHT);
            expect(offsetInView(api, 'r20')).toBe(0);
            expect(offsetInView(api, 'r25')).toBe(6 * ROW_HEIGHT);
        });

        test('keeps the top row in view when rows in view are removed between others', () => {
            const api = createGrid();
            scrollTo(api, SCROLL_TOP);

            api.applyTransaction({ remove: [{ id: 'r0' }, { id: 'r21' }, { id: 'r23' }] as Row[] });

            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP - ROW_HEIGHT);
            expect(offsetInView(api, 'r20')).toBe(0);
        });

        test('keeps rows in view when the same update adds rows above them and sorts rows above them elsewhere', () => {
            const api = createGrid({ columnDefs: [{ field: 'value', sort: 'asc' }] });
            scrollTo(api, SCROLL_TOP);

            api.applyTransaction({
                add: createRows('new', 3).map((row) => ({ ...row, value: -1 })),
                update: [{ id: 'r19', value: 1000 }],
            });

            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP + 2 * ROW_HEIGHT);
            expect(offsetInView(api, 'r20')).toBe(0);
        });

        test('does not follow the top row in view when the same update adds rows and sorts it elsewhere', () => {
            const api = createGrid({ columnDefs: [{ field: 'value', sort: 'asc' }] });
            scrollTo(api, SCROLL_TOP);

            api.applyTransaction({ add: [{ id: 'new', value: 150.5 }], update: [{ id: 'r20', value: 1000 }] });

            expect(api.getDisplayedRowAtIndex(200)!.id).toBe('r20');
            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP - ROW_HEIGHT);
            expect(offsetInView(api, 'r21')).toBe(ROW_HEIGHT);
        });

        test('keeps rows in view when the same update adds rows above them and sorts a row below them above them', () => {
            const api = createGrid({ columnDefs: [{ field: 'value', sort: 'asc' }] });
            scrollTo(api, SCROLL_TOP);

            api.applyTransaction({ add: [{ id: 'new', value: -1 }], update: [{ id: 'r158', value: -2 }] });

            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP + 2 * ROW_HEIGHT);
            expect(offsetInView(api, 'r20')).toBe(0);
        });

        test('uses a scroll position whose scroll event has not fired yet', () => {
            const api = createGrid();
            mockGridLayout.asyncScrollEvents = true;
            getViewport(api).scrollTop = SCROLL_TOP;

            api.applyTransaction({ add: createRows('new', 3), addIndex: 0 });

            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP + 3 * ROW_HEIGHT);
            expect(offsetInView(api, 'r20')).toBe(0);
        });

        test('keeps rows in view when removing a row removes its group above them', () => {
            const api = createGrid({
                columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'value' }],
                rowData: createRows('r', 200).map((row) => ({ ...row, country: row.id === 'r0' ? 'A' : 'B' })),
                groupDefaultExpanded: -1,
                suppressGroupRowsSticky: true,
            });
            scrollTo(api, SCROLL_TOP);
            const offset = offsetInView(api, 'r20');

            api.applyTransaction({ remove: [{ id: 'r0' }] as Row[] });

            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP - 2 * ROW_HEIGHT);
            expect(offsetInView(api, 'r20')).toBe(offset);
        });

        test('keeps the rows below the sticky group rows in view', async () => {
            const api = createGrid({
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'city', rowGroup: true, hide: true },
                    { field: 'value' },
                ],
                rowData: createRows('r', 200).map((row) => ({ ...row, country: 'A', city: 'B' })),
                groupDefaultExpanded: -1,
            });
            scrollTo(api, SCROLL_TOP);
            // the two group rows are sticky over r18 and r19, so r20 is the first row the user can see
            expect(api.getDisplayedRowAtIndex(20)!.id).toBe('r18');
            const root = TestGridsManager.getHTMLElement(api)!;
            await waitFor(() =>
                expect(root.querySelectorAll('.ag-grid-sticky-top-rows-container .ag-row')).toHaveLength(2)
            );
            const offset = offsetInView(api, 'r20');

            api.applyTransaction({ add: [{ id: 'new', value: -1, country: 'A', city: 'B' }], addIndex: 20 });

            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP + ROW_HEIGHT);
            expect(offsetInView(api, 'r20')).toBe(offset);
        });

        test('does not scroll on sorting', () => {
            const api = createGrid({ columnDefs: [{ field: 'value', sortable: true }] });
            scrollTo(api, SCROLL_TOP);

            api.applyColumnState({ state: [{ colId: 'value', sort: 'desc' }] });

            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP);
        });
    });

    describe('groupHideParentOfSingleChild', () => {
        const createGrid = () =>
            gridsManager.createGrid<Row>('myGrid', {
                columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'value' }],
                rowData: [
                    { id: 'a0', value: 0, country: 'A' },
                    ...createRows('b', 200).map((row) => ({ ...row, country: 'B' })),
                ],
                getRowId: ({ data }) => data.id,
                rowHeight: ROW_HEIGHT,
                maintainRowsInViewOnDataUpdate: true,
                groupDefaultExpanded: -1,
                groupHideParentOfSingleChild: true,
                suppressGroupRowsSticky: true,
            });

        test('keeps rows in view when a single-child group above them gains a child and shows its header', () => {
            const api = createGrid();
            scrollTo(api, SCROLL_TOP);
            const offset = offsetInView(api, 'b18');

            api.applyTransaction({ add: [{ id: 'a1', value: 1, country: 'A' }] });

            expect(offsetInView(api, 'b18')).toBe(offset);
        });

        test('keeps rows in view when a two-child group above them loses a child and hides its header', () => {
            const api = createGrid();
            api.applyTransaction({ add: [{ id: 'a1', value: 1, country: 'A' }] });
            scrollTo(api, SCROLL_TOP);
            const offset = offsetInView(api, 'b16');

            api.applyTransaction({ remove: [{ id: 'a1' }] as Row[] });

            expect(offsetInView(api, 'b16')).toBe(offset);
        });
    });

    describe('server-side row model', () => {
        const createGrid = async () => {
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
                maintainRowsInViewOnDataUpdate: true,
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
                maintainRowsInViewOnDataUpdate: true,
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
                maintainRowsInViewOnDataUpdate: true,
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
                maintainRowsInViewOnDataUpdate: true,
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
                maintainRowsInViewOnDataUpdate: true,
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
