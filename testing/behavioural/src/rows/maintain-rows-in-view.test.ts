import { waitFor } from '@testing-library/dom';
import { TestGridsManager, nextAnimationFrame, waitForEvent } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';

import type { GridApi, GridOptions } from 'ag-grid-community';
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

describe('maintaining rows in view', () => {
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

    describe('client-side row model', () => {
        const createGrid = (options?: GridOptions<Row>) =>
            gridsManager.createGrid<Row>('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowData: createRows('r', 200),
                getRowId: ({ data }) => data.id,
                rowHeight: ROW_HEIGHT,
                ...options,
            });

        test('a suppressed update transaction does not restore its rows in view in a later redraw', () => {
            const api = createGrid({ suppressModelUpdateAfterUpdateTransaction: true });
            scrollTo(api, SCROLL_TOP);
            api.applyTransaction({ update: [{ id: 'r0', value: -1 }] });

            scrollTo(api, SCROLL_TOP * 2);
            api.refreshClientSideRowModel('sort');

            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP * 2);
        });

        test('an update that throws before its redraw does not restore its rows in view in a later redraw', async () => {
            let throwOnSort = false;
            const api = createGrid({
                columnDefs: [{ field: 'value', sort: 'asc' }],
                postSortRows: () => {
                    if (throwOnSort) {
                        throw new Error('postSortRows failed');
                    }
                },
            });
            scrollTo(api, SCROLL_TOP);
            throwOnSort = true;
            expect(() => api.applyTransaction({ add: createRows('new', 3), addIndex: 0 })).toThrow(
                'postSortRows failed'
            );
            throwOnSort = false;
            await Promise.resolve();

            scrollTo(api, SCROLL_TOP * 2);
            api.refreshClientSideRowModel('sort');

            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP * 2);
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
    });
});
