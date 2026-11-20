import { waitFor } from '@testing-library/dom';
import { TestGridsManager, asyncSetTimeout, nextAnimationFrame } from 'ag-test-utils';
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

describe('maintaining rows in view through reorders and height changes', () => {
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
            // scrolled from the top first, as at the cached top with nothing focused the update is not anchored
            scrollTo(api, ROW_HEIGHT);
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

        test('keeps rows in view without animating them through an update made before the animation resumes', async () => {
            const api = createGrid({ animateRows: true, ensureDomOrder: false });
            const root = TestGridsManager.getHTMLElement(api)!;
            await nextAnimationFrame();
            scrollTo(api, SCROLL_TOP);
            const isRowAnimationPrevented = () => !!root.querySelector('.ag-prevent-animation');

            api.applyTransaction({ add: createRows('new', 3), addIndex: 0 });
            await nextAnimationFrame();
            api.applyTransaction({ add: createRows('newer', 3), addIndex: 0 });

            // the second update's positions are painted on the next frame, so its rows must not animate until after it
            await nextAnimationFrame();
            expect(isRowAnimationPrevented()).toBe(true);
            await nextAnimationFrame();
            expect(isRowAnimationPrevented()).toBe(false);
        });

        test('keeps rows in view when rows added above them are measured by auto height after the update', async () => {
            const tallRows = new Set<string>();
            mockGridLayout.elementHeightOverride = (el) => {
                if (!el.classList.contains('ag-cell-wrapper') || !el.isConnected) {
                    return undefined;
                }
                return tallRows.has(el.closest('.ag-row')?.getAttribute('row-id') ?? '') ? 3 * ROW_HEIGHT : 20;
            };
            const api = createGrid({ columnDefs: [{ field: 'value', autoHeight: true }] });
            await asyncSetTimeout(0);
            scrollTo(api, SCROLL_TOP);
            tallRows.add('new0');

            api.applyTransaction({ add: createRows('new', 1), addIndex: 0 });
            await waitFor(() => expect(api.getRowNode('new0')!.rowHeight).toBe(3 * ROW_HEIGHT));
            await asyncSetTimeout(0);

            expect(offsetInView(api, 'r20')).toBe(0);
            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP + 3 * ROW_HEIGHT);
        });

        test('does not keep the rows of an earlier update in view for auto height once the user has scrolled', async () => {
            const tallRows = new Set<string>();
            mockGridLayout.elementHeightOverride = (el) => {
                if (!el.classList.contains('ag-cell-wrapper') || !el.isConnected) {
                    return undefined;
                }
                return tallRows.has(el.closest('.ag-row')?.getAttribute('row-id') ?? '') ? 3 * ROW_HEIGHT : 20;
            };
            const api = createGrid({ columnDefs: [{ field: 'value', autoHeight: true }] });
            await asyncSetTimeout(0);
            scrollTo(api, SCROLL_TOP);
            api.applyTransaction({ add: createRows('new', 1), addIndex: 0 });
            await asyncSetTimeout(0);
            scrollTo(api, 2 * SCROLL_TOP);
            const offset = offsetInView(api, 'r60');

            tallRows.add('r5');
            api.redrawRows({ rowNodes: [api.getRowNode('r5')!] });
            await waitFor(() => expect(api.getRowNode('r5')!.rowHeight).toBe(3 * ROW_HEIGHT));
            await asyncSetTimeout(0);

            // a row growing above the rows in view moves them, since no data update moved them
            expect(getViewport(api).scrollTop).toBe(2 * SCROLL_TOP);
            expect(offsetInView(api, 'r60')).toBe(offset + 2 * ROW_HEIGHT);
        });

        test('does not keep the rows of an earlier update in view for auto height once scrolled, before the scroll is handled', async () => {
            const tallRows = new Set<string>();
            mockGridLayout.elementHeightOverride = (el) => {
                if (!el.classList.contains('ag-cell-wrapper') || !el.isConnected) {
                    return undefined;
                }
                return tallRows.has(el.closest('.ag-row')?.getAttribute('row-id') ?? '') ? 3 * ROW_HEIGHT : 20;
            };
            const api = createGrid({
                columnDefs: [{ field: 'value', autoHeight: true }],
                debounceVerticalScrollbar: true,
            });
            await asyncSetTimeout(0);
            scrollTo(api, SCROLL_TOP);
            api.applyTransaction({ add: createRows('new', 1), addIndex: 0 });
            await asyncSetTimeout(0);
            // the debounced scroll is not handled until after the height pass below
            getViewport(api).scrollTop = 2 * SCROLL_TOP;

            tallRows.add('r5');
            api.redrawRows({ rowNodes: [api.getRowNode('r5')!] });
            await waitFor(() => expect(api.getRowNode('r5')!.rowHeight).toBe(3 * ROW_HEIGHT));

            expect(getViewport(api).scrollTop).toBe(2 * SCROLL_TOP);
        });

        test('does not keep the rows of an earlier update in view for auto height once its rows are measured', async () => {
            const tallRows = new Set<string>();
            mockGridLayout.elementHeightOverride = (el) => {
                if (!el.classList.contains('ag-cell-wrapper') || !el.isConnected) {
                    return undefined;
                }
                return tallRows.has(el.closest('.ag-row')?.getAttribute('row-id') ?? '') ? 3 * ROW_HEIGHT : 20;
            };
            const api = createGrid({ columnDefs: [{ field: 'value', autoHeight: true }] });
            await asyncSetTimeout(0);
            scrollTo(api, SCROLL_TOP);
            api.applyTransaction({ remove: [{ id: 'r0', value: 0 }] });
            await asyncSetTimeout(0);
            const scrollTop = getViewport(api).scrollTop;

            tallRows.add('r5');
            api.redrawRows({ rowNodes: [api.getRowNode('r5')!] });
            await waitFor(() => expect(api.getRowNode('r5')!.rowHeight).toBe(3 * ROW_HEIGHT));
            await asyncSetTimeout(0);

            // a row growing above the rows in view moves them, since no data update moved them
            expect(getViewport(api).scrollTop).toBe(scrollTop);
        });

        test.each([0, 1, 2])(
            'keeps the rows after the rows in view in view when every row in view and the next %i rows are removed',
            (removedBelow) => {
                const api = createGrid();
                scrollTo(api, SCROLL_TOP);
                const firstAfterView = Math.ceil(api.getVerticalPixelRange().bottom / ROW_HEIGHT);

                api.applyTransaction({ remove: createRows('r', firstAfterView + removedBelow).slice(20) });

                // the top row in view counts as above the rows after it, as when only it is removed
                expect(getViewport(api).scrollTop).toBe(SCROLL_TOP - ROW_HEIGHT);
                expect(offsetInView(api, `r${firstAfterView + removedBelow}`)).toBe(ROW_HEIGHT);
            }
        );

        test('does not follow the row below the view when the update that removes every row in view sorts it elsewhere', () => {
            const api = createGrid({ columnDefs: [{ field: 'value', sort: 'asc' }] });
            scrollTo(api, SCROLL_TOP);
            const firstAfterView = Math.ceil(api.getVerticalPixelRange().bottom / ROW_HEIGHT);

            api.applyTransaction({
                remove: createRows('r', firstAfterView).slice(20),
                update: [{ id: `r${firstAfterView}`, value: 1000 }],
            });

            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP - ROW_HEIGHT);
            expect(offsetInView(api, `r${firstAfterView + 1}`)).toBe(ROW_HEIGHT);
        });

        test.each([39, 60, 100])(
            'keeps the rows after the rows in view in view when rows from the top row in view to r%i are removed',
            (lastRemoved) => {
                const api = createGrid();
                scrollTo(api, SCROLL_TOP);

                api.applyTransaction({ remove: createRows('r', lastRemoved + 1).slice(20) });

                expect(getViewport(api).scrollTop).toBe(SCROLL_TOP - ROW_HEIGHT);
                expect(offsetInView(api, `r${lastRemoved + 1}`)).toBe(ROW_HEIGHT);
            }
        );

        test('keeps the top row in view when a row is added just below it', () => {
            const api = createGrid();
            scrollTo(api, SCROLL_TOP);

            api.applyTransaction({ add: [{ id: 'new', value: 20.5 }], addIndex: 21 });

            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP);
            expect(offsetInView(api, 'r20')).toBe(0);
            expect(offsetInView(api, 'new')).toBe(ROW_HEIGHT);
        });

        test('does not scroll when an update re-sorts every row in view among themselves', () => {
            const api = createGrid({ columnDefs: [{ field: 'value', sort: 'asc' }] });
            scrollTo(api, SCROLL_TOP);
            const { bottom } = api.getVerticalPixelRange();
            const lastInView = Math.ceil(bottom / ROW_HEIGHT) - 1;
            const update = createRows('r', 200)
                .slice(20, lastInView + 1)
                .map((row) => ({ ...row, value: 20 + lastInView - row.value }));

            api.applyTransaction({ update });

            expect(api.getDisplayedRowAtIndex(lastInView)!.id).toBe('r20');
            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP);
        });

        test('keeps the rows after the rows in view in view when an update filters out every row in view', () => {
            const api = createGrid({
                isExternalFilterPresent: () => true,
                doesExternalFilterPass: ({ data }) => data!.value < 1000,
            });
            scrollTo(api, SCROLL_TOP + 10);

            api.applyTransaction({ update: createRows('r', 40).map((row) => ({ ...row, value: row.value + 1000 })) });

            expect(getViewport(api).scrollTop).toBe(0);
            expect(api.getDisplayedRowAtIndex(0)!.id).toBe('r40');
        });

        test('counts rows added above the rows in view when the same update removes every row in view', () => {
            const api = createGrid();
            scrollTo(api, SCROLL_TOP);
            const { bottom } = api.getVerticalPixelRange();
            const firstAfterView = Math.ceil(bottom / ROW_HEIGHT);
            const offset = offsetInView(api, `r${firstAfterView}`);

            api.applyTransaction({
                add: createRows('new', 3),
                addIndex: 0,
                remove: createRows('r', firstAfterView).slice(20),
            });

            // as when only the rows in view are removed, the top row in view counts as above them
            expect(getViewport(api).scrollTop).toBe(SCROLL_TOP + 3 * ROW_HEIGHT - ROW_HEIGHT);
            expect(offsetInView(api, `r${firstAfterView}`)).toBe(offset - (firstAfterView - 21) * ROW_HEIGHT);
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
});
