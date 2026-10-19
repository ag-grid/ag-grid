import { waitFor } from '@testing-library/dom';
import { TestGridsManager, nextAnimationFrame, waitForEvent } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import { waitForNoLoadingRows } from 'ag-test-utils/ssrm-test-utils';

import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelApiModule, ClientSideRowModelModule, ScrollApiModule } from 'ag-grid-community';
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

        test('keeps rows in view without animating them when animateRows is enabled', async () => {
            const api = createGrid({ animateRows: true, ensureDomOrder: false });
            const root = TestGridsManager.getHTMLElement(api)!;
            await nextAnimationFrame();
            scrollTo(api, SCROLL_TOP);
            const isRowAnimationPrevented = () => !!root.querySelector('.ag-prevent-animation');

            api.applyTransaction({ add: createRows('new', 3), addIndex: 0 });

            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP + 3 * ROW_HEIGHT);
            expect(root.querySelector<HTMLElement>('[row-id="r20"]')!.style.transform).toBe(
                `translateY(${SCROLL_TOP + 3 * ROW_HEIGHT}px)`
            );
            expect(isRowAnimationPrevented()).toBe(true);

            await nextAnimationFrame();
            await nextAnimationFrame();
            expect(isRowAnimationPrevented()).toBe(false);
        });

        test('does not follow the top row in view when an update sorts it elsewhere', () => {
            const api = createGrid({ columnDefs: [{ field: 'value', sort: 'asc' }] });
            scrollTo(api, SCROLL_TOP);

            api.applyTransaction({ update: [{ id: 'r20', value: 1000 }] });

            expect(api.getDisplayedRowAtIndex(199)!.id).toBe('r20');
            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP - ROW_HEIGHT);
            expect(offsetInView(api, 'r21')).toBe(ROW_HEIGHT);
        });

        test('uses a scroll position whose scroll event has not fired yet', () => {
            const api = createGrid();
            mockGridLayout.asyncScrollEvents = true;
            getViewport(api).scrollTop = SCROLL_TOP;

            api.applyTransaction({ add: createRows('new', 3), addIndex: 0 });

            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP + 3 * ROW_HEIGHT);
            expect(offsetInView(api, 'r20')).toBe(0);
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

        test('keeps rows in view when async transactions add rows above them', async () => {
            const api = await createGrid();
            scrollTo(api, SCROLL_TOP);

            api.applyServerSideTransactionAsync({ add: createRows('new', 2), addIndex: 0 });
            api.flushServerSideAsyncTransactions();

            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP + 2 * ROW_HEIGHT);
            expect(offsetInView(api, 'r20')).toBe(0);
        });
    });
});
