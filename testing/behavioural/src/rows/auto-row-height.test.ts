import { waitFor } from '@testing-library/dom';
import { TestGridsManager, asyncSetTimeout, nextAnimationFrame } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import { installMockResizeObserver, triggerResizeObservers } from 'ag-test-utils/polyfills/mockResizeObserver';

import type { ColDef, GridApi, IServerSideGetRowsParams } from 'ag-grid-community';
import {
    CellSpanModule,
    CellStyleModule,
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    PinnedRowModule,
    RenderApiModule,
    RowApiModule,
    RowAutoHeightModule,
    ScrollApiModule,
    TextEditorModule,
    getGridElement,
} from 'ag-grid-community';
import { PivotModule, RowGroupingModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

/** happy-dom lays nothing out, so every height the grid measures comes from {@link cellHeights}, keyed
 *  `rowIndex:colId` (or `*:colId` for every row). */
describe('Auto row height', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            CellSpanModule,
            CellStyleModule,
            ClientSideRowModelApiModule,
            ClientSideRowModelModule,
            ColumnApiModule,
            PinnedRowModule,
            RenderApiModule,
            RowApiModule,
            PivotModule,
            RowAutoHeightModule,
            RowGroupingModule,
            ScrollApiModule,
            ServerSideRowModelModule,
            TextEditorModule,
        ],
    });

    /** Default `--ag-row-height`, and what an unmeasured row keeps. */
    const DEFAULT_ROW_HEIGHT = 42;

    const cellHeights = new Map<string, number>();

    beforeAll(() => {
        // Auto height measures `offsetHeight`, which reads 0 for everything without this.
        mockGridLayout.useRealOffsetDimensions = true;
        mockGridLayout.elementHeightOverride = (el) => {
            if (!el.classList.contains('ag-cell-wrapper')) {
                return undefined;
            }
            // As in a browser, an element out of the document has no size.
            if (!el.isConnected) {
                return 0;
            }
            const colId = el.closest('.ag-cell')?.getAttribute('col-id');
            if (colId == null) {
                return undefined;
            }
            // A row-spanned cell renders inside the span's first row, so it answers to that row's key:
            // leaving that row unkeyed is what lets `*` set a span's height apart from the rest.
            const rowIndex = el.closest('.ag-row')?.getAttribute('row-index');
            const byRow = rowIndex == null ? undefined : cellHeights.get(`${rowIndex}:${colId}`);
            return byRow ?? cellHeights.get(`*:${colId}`);
        };
    });

    afterAll(() => {
        mockGridLayout.useRealOffsetDimensions = false;
        mockGridLayout.elementHeightOverride = undefined;
    });

    afterEach(() => {
        cellHeights.clear();
        gridsManager.reset();
    });

    const rowHeight = (api: GridApi, rowIndex: number): number => api.getDisplayedRowAtIndex(rowIndex)!.rowHeight!;

    const renderedRows = (api: GridApi): number[] => api.getRenderedNodes().map((node) => node.rowIndex!);

    const rowElement = (rowIndex: number): HTMLElement =>
        document.querySelector<HTMLElement>(`.ag-row[row-index="${rowIndex}"]`)!;

    const rowData = (count: number): { a: string; b: string }[] =>
        Array.from({ length: count }, (_, i) => ({ a: `a${i}`, b: `b${i}` }));

    /** Lets a pass, its measurements and the frames the renderers paint on all run. */
    const settle = async (): Promise<void> => {
        await asyncSetTimeout(0);
        await nextAnimationFrame();
        await nextAnimationFrame();
        await asyncSetTimeout(0);
    };

    // Documented: "if multiple columns are marked with autoHeight=true then the height of the largest
    // column is used".
    test('the tallest of several auto-height columns decides the row', async () => {
        cellHeights.set('0:a', 40);
        cellHeights.set('0:b', 120);
        cellHeights.set('0:c', 70);
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'a', autoHeight: true },
                { field: 'b', autoHeight: true },
                { field: 'c', autoHeight: true },
            ],
            rowData: [{ a: 'a0', b: 'b0', c: 'c0' }],
        });

        await waitFor(() => expect(rowHeight(api, 0)).toBe(120));
    });

    test('each row is measured from its own cells', async () => {
        cellHeights.set('0:b', 100);
        cellHeights.set('1:b', 60);
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b', autoHeight: true }],
            rowData: rowData(2),
        });

        await waitFor(() => expect(rowHeight(api, 0)).toBe(100));
        expect(rowHeight(api, 1)).toBe(60);
    });

    test('a measurement shorter than the configured height leaves the row alone', async () => {
        cellHeights.set('0:b', 20);
        cellHeights.set('1:b', 90);
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b', autoHeight: true }],
            rowData: rowData(2),
            rowHeight: 55,
        });

        // The taller row shows the measurements have been applied.
        await waitFor(() => expect(rowHeight(api, 1)).toBe(90));
        expect(rowHeight(api, 0)).toBe(55);
    });

    test('a rebuilt cell is measured again', async () => {
        cellHeights.set('0:b', 90);
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b', autoHeight: true }],
            rowData: rowData(1),
        });
        await waitFor(() => expect(rowHeight(api, 0)).toBe(90));

        cellHeights.set('0:b', 140);
        api.redrawRows();

        await waitFor(() => expect(rowHeight(api, 0)).toBe(140));
    });

    // Documented: auto height "is only looking at rows that are currently rendered into the DOM. As the
    // grid scrolls vertically and more rows are displayed, the height of those rows will be calculated
    // on the fly."
    test('a row is measured when it is rendered, not before', async () => {
        cellHeights.set('*:b', 90);
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b', autoHeight: true }],
            rowData: rowData(200),
            // The behavioural default renders every row, which is the opposite of what this asserts.
            suppressRowVirtualisation: false,
        });
        await waitFor(() => expect(rowHeight(api, 0)).toBe(90));

        expect(renderedRows(api)).not.toContain(150);
        expect(rowHeight(api, 150)).toBe(DEFAULT_ROW_HEIGHT);

        api.ensureIndexVisible(150, 'top');

        await waitFor(() => expect(rowHeight(api, 150)).toBe(90));
    });

    // The last auto-height column going away leaves every row holding a height nothing measures any
    // more, including the rows that have been scrolled away from.
    test('hiding the auto-height column releases the height of a row that is no longer rendered', async () => {
        cellHeights.set('*:b', 90);
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b', colId: 'b', autoHeight: true }],
            rowData: rowData(200),
            suppressRowVirtualisation: false,
        });
        await waitFor(() => expect(rowHeight(api, 0)).toBe(90));

        api.ensureIndexVisible(150, 'top');
        await waitFor(() => expect(rowHeight(api, 150)).toBe(90));
        expect(renderedRows(api)).not.toContain(0);
        expect(rowHeight(api, 0)).toBe(90);

        api.setColumnsVisible(['b'], false);

        await waitFor(() => expect(rowHeight(api, 150)).toBe(DEFAULT_ROW_HEIGHT));
        expect(rowHeight(api, 0)).toBe(DEFAULT_ROW_HEIGHT);
    });

    // A group's total row is walked only when the model is asked for its footers, yet it holds the height
    // auto height gave it like any other row does.
    test('hiding the auto-height column releases the height of a group total row', async () => {
        cellHeights.set('*:b', 150);
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'g', rowGroup: true, hide: true },
                { field: 'a' },
                { field: 'b', colId: 'b', autoHeight: true },
            ],
            rowData: [{ g: 'x', a: 'a0', b: 'b0' }],
            groupDefaultExpanded: 1,
            groupTotalRow: 'bottom',
        });
        await waitFor(() => expect(api.getDisplayedRowCount()).toBe(3));
        const total = api.getDisplayedRowAtIndex(2)!;
        expect(total.footer).toBe(true);
        await waitFor(() => expect(total.rowHeight).toBe(150));

        api.setColumnsVisible(['b'], false);

        await waitFor(() => expect(total.rowHeight).toBe(DEFAULT_ROW_HEIGHT));
    });

    test('hiding the auto-height column releases the height of a server-side group total row', async () => {
        cellHeights.set('*:b', 150);
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'g', rowGroup: true, hide: true },
                { field: 'a' },
                { field: 'b', colId: 'b', autoHeight: true },
            ],
            rowModelType: 'serverSide',
            groupTotalRow: 'bottom',
            isServerSideGroupOpenByDefault: () => true,
            serverSideDatasource: {
                getRows: (params) =>
                    params.success({
                        rowData: params.request.groupKeys.length ? [{ g: 'x', a: 'a0', b: 'b0' }] : [{ g: 'x' }],
                    }),
            },
        });
        await waitFor(() => expect(api.getDisplayedRowCount()).toBe(3));
        const total = api.getDisplayedRowAtIndex(2)!;
        expect(total.footer).toBe(true);
        await waitFor(() => expect(total.rowHeight).toBe(150));

        api.setColumnsVisible(['b'], false);

        await waitFor(() => expect(total.rowHeight).toBe(DEFAULT_ROW_HEIGHT));
    });

    test('hiding the auto-height column releases the height of the root row pivot mode shows', async () => {
        cellHeights.set('*:v', 120);
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'v', colId: 'v', aggFunc: 'sum', autoHeight: true }],
            rowData: [{ v: 1 }, { v: 2 }],
            pivotMode: true,
        });
        await waitFor(() => expect(rowHeight(api, 0)).toBe(120));
        expect(api.getDisplayedRowAtIndex(0)!.level).toBe(-1);

        api.setGridOption('columnDefs', [{ field: 'v', colId: 'v', aggFunc: 'sum' }]);

        await waitFor(() => expect(rowHeight(api, 0)).toBe(DEFAULT_ROW_HEIGHT));
    });

    test('a group total row added after its group was measured is released with the rest', async () => {
        cellHeights.set('*:b', 150);
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'g', rowGroup: true, hide: true },
                { field: 'a' },
                { field: 'b', colId: 'b', autoHeight: true },
            ],
            rowData: [{ g: 'x', a: 'a0', b: 'b0' }],
            groupDefaultExpanded: 1,
        });
        await waitFor(() => expect(rowHeight(api, 0)).toBe(150));

        api.setGridOption('groupTotalRow', 'bottom');
        api.setColumnsVisible(['b'], false);

        await waitFor(() => expect(rowHeight(api, 0)).toBe(DEFAULT_ROW_HEIGHT));
        await settle();
        const total = api.getDisplayedRowAtIndex(2)!;
        expect(total.footer).toBe(true);
        expect(total.rowHeight).toBe(DEFAULT_ROW_HEIGHT);
    });

    // A taller pinned row has to push the pinned rows below it down, or they overlap it.
    test('pinned rows are measured like any other rendered row, and a taller one moves those below it', async () => {
        cellHeights.set('t-0:b', 120);
        cellHeights.set('b-0:b', 130);
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b', autoHeight: true }],
            rowData: rowData(1),
            pinnedTopRowData: [
                { a: 'p0', b: 'p0' },
                { a: 'p1', b: 'p1' },
            ],
            pinnedBottomRowData: [{ a: 'bottom', b: 'bottom' }],
        });

        await waitFor(() => expect(api.getPinnedTopRow(0)!.rowHeight).toBe(120));
        expect(api.getPinnedTopRow(1)!.rowTop).toBe(120);
        expect(api.getPinnedBottomRow(0)!.rowHeight).toBe(130);
    });

    test('hiding the auto-height column releases the height of pinned rows', async () => {
        cellHeights.set('t-0:b', 120);
        cellHeights.set('b-0:b', 130);
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b', colId: 'b', autoHeight: true }],
            rowData: rowData(1),
            pinnedTopRowData: [{ a: 'top', b: 'top' }],
            pinnedBottomRowData: [{ a: 'bottom', b: 'bottom' }],
        });
        await waitFor(() => expect(api.getPinnedBottomRow(0)!.rowHeight).toBe(130));
        expect(api.getPinnedTopRow(0)!.rowHeight).toBe(120);

        api.setColumnsVisible(['b'], false);

        await waitFor(() => expect(api.getPinnedTopRow(0)!.rowHeight).toBe(DEFAULT_ROW_HEIGHT));
        expect(api.getPinnedBottomRow(0)!.rowHeight).toBe(DEFAULT_ROW_HEIGHT);
    });

    // A column a run spans over renders no cell of its own, so it has no height to contribute and must
    // not hold back the row that spans it.
    test('a column covered by a colSpan run does not hold its row unmeasured', async () => {
        cellHeights.set('1:b', 80);
        cellHeights.set('*:c', 20);
        cellHeights.set('0:c', 90);
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'a', colSpan: (params) => (params.data.wide ? 2 : 1) },
                { field: 'b', autoHeight: true },
                { field: 'c', autoHeight: true },
            ],
            rowData: [
                { a: 'a0', b: 'b0', c: 'c0', wide: true },
                { a: 'a1', b: 'b1', c: 'c1', wide: false },
            ],
        });

        // Row 0 has no `b` cell: it is sized by the auto-height cell it does have.
        await waitFor(() => expect(rowHeight(api, 0)).toBe(90));
        expect(rowHeight(api, 1)).toBe(80);
    });

    describe('with row spanning', () => {
        const spanningGrid = (gridId: string, rows: Record<string, string>[], extraCols: ColDef[] = []): GridApi =>
            gridsManager.createGrid(gridId, {
                columnDefs: [{ field: 'a' }, { field: 'b', spanRows: true, autoHeight: true }, ...extraCols],
                enableCellSpan: true,
                rowData: rows,
            });

        // A spanned cell is measured once, against the row that renders it, and the rows above the last one
        // keep their own height: the remainder lands on the last row so the run ends level with it.
        test('the rows a span covers share its height, and only the last takes what is left', async () => {
            cellHeights.set('*:b', 150);
            const api = spanningGrid('myGrid', [
                { a: 'a0', b: 'same' },
                { a: 'a1', b: 'same' },
                { a: 'a2', b: 'same' },
            ]);
            await settle();

            // 150 less the two rows above it, which keep the configured height.
            await waitFor(() =>
                expect([rowHeight(api, 0), rowHeight(api, 1), rowHeight(api, 2)]).toEqual([
                    DEFAULT_ROW_HEIGHT,
                    DEFAULT_ROW_HEIGHT,
                    150 - 2 * DEFAULT_ROW_HEIGHT,
                ])
            );
        });

        test('a span shorter than the rows it covers leaves them at the configured height', async () => {
            cellHeights.set('*:b', 50);
            const api = spanningGrid('myGrid', [
                { a: 'a0', b: 'same' },
                { a: 'a1', b: 'same' },
            ]);
            await settle();

            await waitFor(() => expect(rowHeight(api, 1)).toBe(DEFAULT_ROW_HEIGHT));
            expect(rowHeight(api, 0)).toBe(DEFAULT_ROW_HEIGHT);
        });

        // Every column spans, so the rows render no cells of their own: the last still takes the span's share.
        test('a span whose last row has no cells of its own still gives it its share', async () => {
            cellHeights.set('*:b', 150);
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'a', spanRows: true },
                    { field: 'b', spanRows: true, autoHeight: true },
                ],
                enableCellSpan: true,
                rowData: [
                    { a: 'same', b: 'same' },
                    { a: 'same', b: 'same' },
                ],
            });
            await settle();

            await waitFor(() => expect(rowHeight(api, 1)).toBe(150 - DEFAULT_ROW_HEIGHT));
            expect(rowHeight(api, 0)).toBe(DEFAULT_ROW_HEIGHT);
            expect(api.getDisplayedRowAtIndex(1)!.rowTop).toBe(DEFAULT_ROW_HEIGHT);
        });

        // The row a span is anchored to renders the spanned cell, but that cell's height belongs to the
        // span: the row itself is sized by its own auto-height cells, as any other row is.
        test('the row a span is anchored to is sized by its own cells', async () => {
            cellHeights.set('*:b', 200);
            cellHeights.set('0:c', 100);
            const api = spanningGrid(
                'myGrid',
                [
                    { a: 'a0', b: 'same' },
                    { a: 'a1', b: 'same' },
                ],
                [{ field: 'c', autoHeight: true }]
            );
            await settle();

            await waitFor(() => expect(rowHeight(api, 0)).toBe(100));
        });

        // The share a span leaves its last row shrinks with the cell. The cell belongs to the spanned row,
        // not to that last row, so the last row reports nothing and the height an earlier pass left on it
        // cannot stand in for what its own cells need.
        test('a span whose cell shrinks gives back the height it no longer needs', async () => {
            const uninstallResizeObserver = installMockResizeObserver();
            try {
                cellHeights.set('*:b', 120);
                const api = spanningGrid('myGrid', [
                    { a: 'a0', b: 'same' },
                    { a: 'a1', b: 'same' },
                ]);
                await settle();
                await waitFor(() => expect(rowHeight(api, 1)).toBe(120 - DEFAULT_ROW_HEIGHT));

                cellHeights.set('*:b', 90);
                triggerResizeObservers();

                await waitFor(() => expect(rowHeight(api, 1)).toBe(90 - DEFAULT_ROW_HEIGHT));
            } finally {
                uninstallResizeObserver();
            }
        });

        // Every row belongs to a run, so every row renders a plain auto-height cell of its own while the
        // spanning column's cell is rendered against the run's first row only.
        test('rows covered by a span are still sized by their own auto-height cells', async () => {
            cellHeights.set('*:b', 60);
            cellHeights.set('*:c', 90);
            const api = spanningGrid(
                'myGrid',
                [
                    { a: 'a0', b: 'run1', c: 'c0' },
                    { a: 'a1', b: 'run1', c: 'c1' },
                    { a: 'a2', b: 'run1', c: 'c2' },
                    { a: 'a3', b: 'run2', c: 'c3' },
                    { a: 'a4', b: 'run2', c: 'c4' },
                    { a: 'a5', b: 'run2', c: 'c5' },
                ],
                [{ field: 'c', autoHeight: true }]
            );
            await settle();

            await waitFor(() => expect(rowHeight(api, 1)).toBe(90));
            expect([rowHeight(api, 0), rowHeight(api, 3), rowHeight(api, 4)]).toEqual([90, 90, 90]);
        });

        // Two spanning columns whose runs are offset, so the row one span ends on is the row the next
        // span starts from: the second span's remainder is whatever the first left that row.
        test('a span starting where another ends takes the height that one left', async () => {
            // Every row is covered by a span in both columns, so no row has an auto-height cell of its
            // own and `*` gives each span its height without also sizing a row directly.
            cellHeights.set('*:b', 200);
            cellHeights.set('*:c', 100);
            const api = spanningGrid(
                'myGrid',
                [
                    { a: 'a0', b: 'x', c: 'p' },
                    { a: 'a1', b: 'x', c: 'p' },
                    { a: 'a2', b: 'x', c: 'r' },
                    { a: 'a3', b: 'y', c: 'r' },
                    { a: 'a4', b: 'y', c: 'r' },
                ],
                [{ field: 'c', spanRows: true, autoHeight: true }]
            );
            await settle();

            // c spans 0-1 and leaves 100 - 42 = 58 on row 1. b spans 0-2, so its remainder for row 2 is
            // 200 - 42 - 58 = 100; reading row 1 as still unsized would ask for 116 instead. b's second
            // span (3-4) then puts 200 - 42 = 158 on row 4, which is taller than c's 100 can reach.
            await waitFor(() =>
                expect([0, 1, 2, 3, 4].map((i) => rowHeight(api, i))).toEqual([
                    DEFAULT_ROW_HEIGHT,
                    58,
                    100,
                    DEFAULT_ROW_HEIGHT,
                    158,
                ])
            );
        });

        // Three spans over the same rows all end on the same row, so it has to be tall enough for the
        // tallest of them rather than whichever was shared out last.
        test('a row ending three coextensive spans takes the tallest', async () => {
            cellHeights.set('*:b', 300);
            cellHeights.set('*:c', 200);
            cellHeights.set('*:d', 100);
            const api = spanningGrid(
                'myGrid',
                [
                    { a: 'a0', b: 'x', c: 'p', d: 'q' },
                    { a: 'a1', b: 'x', c: 'p', d: 'q' },
                    { a: 'a2', b: 'x', c: 'p', d: 'q' },
                ],
                [
                    { field: 'c', spanRows: true, autoHeight: true },
                    { field: 'd', spanRows: true, autoHeight: true },
                ]
            );
            await settle();

            await waitFor(() =>
                expect([0, 1, 2].map((i) => rowHeight(api, i))).toEqual([
                    DEFAULT_ROW_HEIGHT,
                    DEFAULT_ROW_HEIGHT,
                    300 - 2 * DEFAULT_ROW_HEIGHT,
                ])
            );
        });

        // Three links: row 1 ends b's first span, row 2 ends c's first and depends on row 1, row 3 ends
        // b's second and depends on row 2. Each has to be settled before the next is asked.
        test('a chain of spans is settled from the top down', async () => {
            cellHeights.set('*:b', 100);
            cellHeights.set('*:c', 200);
            const api = spanningGrid(
                'myGrid',
                [
                    { a: 'a0', b: 'x', c: 'p' },
                    { a: 'a1', b: 'x', c: 'p' },
                    { a: 'a2', b: 'y', c: 'p' },
                    { a: 'a3', b: 'y', c: 'q' },
                    { a: 'a4', b: 'z', c: 'q' },
                    { a: 'a5', b: 'z', c: 'q' },
                ],
                [{ field: 'c', spanRows: true, autoHeight: true }]
            );
            await settle();

            // row1 = 100-42 = 58; row2 = 200-(42+58) = 100; row3 = 100-100 = 0, so its configured height
            // stands; row5 = max(200-(42+42), 100-42) = 116.
            await waitFor(() =>
                expect([0, 1, 2, 3, 4, 5].map((i) => rowHeight(api, i))).toEqual([
                    DEFAULT_ROW_HEIGHT,
                    58,
                    100,
                    DEFAULT_ROW_HEIGHT,
                    DEFAULT_ROW_HEIGHT,
                    116,
                ])
            );
        });

        // Spans are collected in the order they are rendered, which is by the row each one starts on. A
        // span nested inside another ends first but starts second, so the outer one reads the nested
        // one's last row before it has taken its share unless the two are put in the order they end.
        test('a span nested inside another is settled before it', async () => {
            // Every row is covered by a span in both columns, so `*` gives each span its height without
            // also sizing a row directly.
            cellHeights.set('*:b', 500);
            cellHeights.set('*:c', 200);
            const api = spanningGrid(
                'myGrid',
                [
                    { a: 'a0', b: 'x', c: 'p' },
                    { a: 'a1', b: 'x', c: 'p' },
                    { a: 'a2', b: 'x', c: 'p' },
                    { a: 'a3', b: 'x', c: 'q' },
                    { a: 'a4', b: 'x', c: 'q' },
                ],
                [{ field: 'c', spanRows: true, autoHeight: true }]
            );
            await settle();

            // Both start on row 0, so b's is collected first, yet its remainder for row 4 must count c's share of row 2.
            const cShare = 200 - 2 * DEFAULT_ROW_HEIGHT;
            await waitFor(() =>
                expect([0, 1, 2, 3, 4].map((i) => rowHeight(api, i))).toEqual([
                    DEFAULT_ROW_HEIGHT,
                    DEFAULT_ROW_HEIGHT,
                    cShare,
                    DEFAULT_ROW_HEIGHT,
                    500 - (3 * DEFAULT_ROW_HEIGHT + cShare),
                ])
            );
        });

        // The row a span ends on is held against its own cells as well: a span asking for less than the
        // row already needs must not shrink it.
        test('the row a span ends on keeps its own height when that is taller', async () => {
            cellHeights.set('*:b', 200);
            cellHeights.set('1:e', 500);
            const api = spanningGrid(
                'myGrid',
                [
                    { a: 'a0', b: 'x', e: 'e0' },
                    { a: 'a1', b: 'x', e: 'e1' },
                ],
                [{ field: 'e', autoHeight: true }]
            );
            await settle();

            await waitFor(() => expect(rowHeight(api, 1)).toBe(500));
            expect(rowHeight(api, 0)).toBe(DEFAULT_ROW_HEIGHT);
        });

        test('hiding the spanning column releases the height it shared out', async () => {
            cellHeights.set('*:b', 200);
            const api = spanningGrid('myGrid', [
                { a: 'a0', b: 'x' },
                { a: 'a1', b: 'x' },
            ]);
            await settle();
            await waitFor(() => expect(rowHeight(api, 1)).toBe(200 - DEFAULT_ROW_HEIGHT));

            api.setColumnsVisible(['b'], false);
            await settle();

            await waitFor(() =>
                expect([rowHeight(api, 0), rowHeight(api, 1)]).toEqual([DEFAULT_ROW_HEIGHT, DEFAULT_ROW_HEIGHT])
            );
        });

        test('a row that leaves a span is sized by its own cell again', async () => {
            cellHeights.set('*:b', 150);
            const api = spanningGrid('myGrid', [
                { a: 'a0', b: 'same' },
                { a: 'a1', b: 'same' },
            ]);
            await settle();
            await waitFor(() => expect(rowHeight(api, 1)).toBe(150 - DEFAULT_ROW_HEIGHT));

            // No longer part of the span, so it renders and is measured by its own cell.
            api.getDisplayedRowAtIndex(1)!.setDataValue('b', 'other');
            await settle();

            await waitFor(() => expect(rowHeight(api, 1)).toBe(150));
        });

        /**
         * Keys every row outside the span so its own cell measures `unspannedHeight`, leaving the span's
         * rows unkeyed so that `*`, and so `spanHeight`, is what the spanned cell measures.
         */
        const virtualisedSpanGrid = (
            gridId: string,
            spannedRows: number[],
            unspannedHeight: number,
            spanHeight: number
        ): GridApi => {
            for (let i = 0; i < 200; ++i) {
                if (!spannedRows.includes(i)) {
                    cellHeights.set(`${i}:b`, unspannedHeight);
                }
            }
            cellHeights.set('*:b', spanHeight);
            return gridsManager.createGrid(gridId, {
                columnDefs: [{ field: 'a' }, { field: 'b', spanRows: true, autoHeight: true }],
                enableCellSpan: true,
                rowData: Array.from({ length: 200 }, (_, i) => ({
                    a: `a${i}`,
                    b: spannedRows.includes(i) ? 'same' : `b${i}`,
                })),
                suppressRowVirtualisation: false,
            });
        };

        // The remainder of a span lands on its last row, and that row can sit below the rendered ones while
        // the row rendering the cell is among them. Nothing measures it on the way back, so a pass that
        // reaches only the rendered rows leaves the span taller than the rows it covers.
        test('a span reaching past the rendered rows grows and shrinks its last row', async () => {
            const uninstallResizeObserver = installMockResizeObserver();
            try {
                const spannedRows = Array.from({ length: 21 }, (_, i) => 20 + i);
                const api = virtualisedSpanGrid('myGrid', spannedRows, 20, 1200);
                await settle();

                expect(renderedRows(api)).toContain(20);
                expect(renderedRows(api)).not.toContain(40);

                // 1200 less the twenty rows above it, which keep the configured height.
                await waitFor(() => expect(rowHeight(api, 40)).toBe(1200 - 20 * DEFAULT_ROW_HEIGHT));

                cellHeights.set('*:b', 1000);
                triggerResizeObservers();

                await waitFor(() => expect(rowHeight(api, 40)).toBe(1000 - 20 * DEFAULT_ROW_HEIGHT));
                expect(renderedRows(api)).not.toContain(40);
            } finally {
                uninstallResizeObserver();
            }
        });

        // Out of view, the row a span ends on has no cells to measure again, so what they measured last stands.
        test('a span whose last row is scrolled out of view keeps the height that row measured itself', async () => {
            const uninstallResizeObserver = installMockResizeObserver();
            try {
                // Rows 20 to 39 keep the configured height, so the span leaves 60 for row 40, which needs 300.
                for (let i = 0; i < 200; ++i) {
                    if (i < 20 || i > 40) {
                        cellHeights.set(`${i}:b`, 20);
                    }
                }
                cellHeights.set('*:b', 900);
                cellHeights.set('*:c', 20);
                cellHeights.set('40:c', 300);
                const api = gridsManager.createGrid('myGrid', {
                    columnDefs: [
                        { field: 'a' },
                        { field: 'b', spanRows: true, autoHeight: true },
                        { field: 'c', autoHeight: true },
                    ],
                    enableCellSpan: true,
                    rowData: Array.from({ length: 200 }, (_, i) => ({
                        a: `a${i}`,
                        b: i >= 20 && i <= 40 ? 'same' : `b${i}`,
                        c: `c${i}`,
                    })),
                    suppressRowVirtualisation: false,
                });
                await settle();

                api.ensureIndexVisible(40, 'bottom');
                await waitFor(() => expect(rowHeight(api, 40)).toBe(300));

                api.ensureIndexVisible(0, 'top');
                await waitFor(() => expect(renderedRows(api)).not.toContain(40));
                expect(renderedRows(api)).toContain(20);

                // Any report runs a pass, and every pass shares the span out again.
                cellHeights.set('0:c', 60);
                triggerResizeObservers();
                await waitFor(() => expect(rowHeight(api, 0)).toBe(60));
                await settle();

                expect(rowHeight(api, 40)).toBe(300);
            } finally {
                uninstallResizeObserver();
            }
        });

        test('a span re-headed while its last row is out of view keeps the height that row measured itself', async () => {
            const uninstallResizeObserver = installMockResizeObserver();
            try {
                for (let i = 0; i < 200; ++i) {
                    if (i < 20 || i > 40) {
                        cellHeights.set(`${i}:b`, 20);
                    }
                }
                cellHeights.set('*:b', 900);
                cellHeights.set('*:c', 20);
                cellHeights.set('40:c', 300);
                const api = gridsManager.createGrid('myGrid', {
                    columnDefs: [
                        { field: 'a' },
                        { field: 'b', spanRows: true, autoHeight: true },
                        { field: 'c', autoHeight: true },
                    ],
                    enableCellSpan: true,
                    rowData: Array.from({ length: 200 }, (_, i) => ({
                        a: `a${i}`,
                        b: i >= 20 && i <= 40 ? 'same' : `b${i}`,
                        c: `c${i}`,
                    })),
                    suppressRowVirtualisation: false,
                });
                await settle();

                api.ensureIndexVisible(40, 'bottom');
                await waitFor(() => expect(rowHeight(api, 40)).toBe(300));
                api.ensureIndexVisible(0, 'top');
                await waitFor(() => expect(renderedRows(api)).not.toContain(40));

                // Row 20 leaves, so the span is rebuilt from row 21 as a new one.
                api.getDisplayedRowAtIndex(20)!.setDataValue('b', 'other');
                await settle();
                cellHeights.set('0:c', 60);
                triggerResizeObservers();
                await waitFor(() => expect(rowHeight(api, 0)).toBe(60));
                await settle();

                expect(rowHeight(api, 40)).toBe(300);
            } finally {
                uninstallResizeObserver();
            }
        });

        // The share a span leaves its last row decides that row, so a cell of the row reporting a height the
        // share already covers moves nothing, rather than moving it to its own height and back.
        test('a cell reporting on the row a span ends on leaves that row alone while the span decides it', async () => {
            const uninstallResizeObserver = installMockResizeObserver();
            try {
                cellHeights.set('*:b', 300);
                cellHeights.set('*:c', 20);
                const api = spanningGrid(
                    'myGrid',
                    [
                        { a: 'a0', b: 'same', c: 'c0' },
                        { a: 'a1', b: 'same', c: 'c1' },
                    ],
                    [{ field: 'c', autoHeight: true }]
                );
                await settle();
                await waitFor(() => expect(rowHeight(api, 1)).toBe(300 - DEFAULT_ROW_HEIGHT));

                let heightChanges = 0;
                api.getDisplayedRowAtIndex(1)!.addEventListener('heightChanged', () => ++heightChanges);
                cellHeights.set('1:c', 30);
                triggerResizeObservers(
                    document.querySelector('#myGrid [row-index="1"] [col-id="c"] .ag-cell-wrapper')!
                );
                await settle();

                expect(rowHeight(api, 1)).toBe(300 - DEFAULT_ROW_HEIGHT);
                expect(heightChanges).toBe(0);
            } finally {
                uninstallResizeObserver();
            }
        });

        // Growing the rows the spans it brought on screen end on moves the target down, so the scroll waits.
        test('a scroll waits for the spans it brings on screen to be applied', async () => {
            cellHeights.set('*:b', 90);
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'a' }, { field: 'b', spanRows: true, autoHeight: true }],
                enableCellSpan: true,
                rowData: Array.from({ length: 200 }, (_, i) => ({ a: `a${i}`, b: `s${Math.floor(i / 2)}` })),
                suppressRowVirtualisation: false,
            });
            await settle();

            api.ensureIndexVisible(150, 'top');
            await waitFor(() => expect(rowHeight(api, 149)).toBe(90 - DEFAULT_ROW_HEIGHT));
            await settle();

            expect(api.getDisplayedRowAtIndex(150)!.rowTop! - api.getVerticalPixelRange().top).toBe(0);
        });

        // The row a span ends on is held against its own cells as well, so while one of them has still to
        // report the span has nothing to be held against and waits, rather than size the row without it.
        test('a span waits on the row it ends on while a cell of that row is still to report', async () => {
            const uninstallResizeObserver = installMockResizeObserver();
            try {
                cellHeights.set('*:b', 200);
                cellHeights.set('*:c', 50);
                const api = spanningGrid(
                    'myGrid',
                    [
                        { a: 'a0', b: 'x', c: 'c0' },
                        { a: 'a1', b: 'x', c: 'c1' },
                    ],
                    [{ field: 'c', autoHeight: true, editable: true }]
                );
                // Before its first measurement, which editing then holds back.
                api.startEditingCell({ rowIndex: 1, colKey: 'c' });
                const endsOn = api.getDisplayedRowAtIndex(1)!;
                let resized = 0;
                endsOn.addEventListener('heightChanged', () => ++resized);
                await settle();
                // Not resized at all, rather than resized to something partial and put back.
                expect(resized).toBe(0);
                expect(endsOn.rowHeight).toBe(DEFAULT_ROW_HEIGHT);

                // The renderer replacing the editor is a resize, which the browser reports. Row 0 is sized by
                // its own c, so the span leaves 200 - 50 for the row it ends on.
                api.stopEditing(true);
                triggerResizeObservers();
                await waitFor(() => expect(rowHeight(api, 1)).toBe(150));
                expect(rowHeight(api, 0)).toBe(50);
            } finally {
                uninstallResizeObserver();
            }
        });

        // Spanning off gives each row its own cell in the column, and back on hands the column to one cell
        // for the run: whichever order those cells come and go in, only the span's own measurement counts.
        test('a span toggled on and off in quick succession ends level with the rows it covers', async () => {
            cellHeights.set('*:b', 200);
            cellHeights.set('*:c', 50);
            const columnDefs = (spanRows: boolean): ColDef[] => [
                { field: 'a' },
                { field: 'b', spanRows, autoHeight: true },
                { field: 'c', autoHeight: true },
            ];
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: columnDefs(true),
                enableCellSpan: true,
                rowData: [
                    { a: 'a0', b: 'x', c: 'c0' },
                    { a: 'a1', b: 'x', c: 'c1' },
                ],
            });
            await waitFor(() => expect([rowHeight(api, 0), rowHeight(api, 1)]).toEqual([50, 150]));

            for (let i = 0; i < 6; ++i) {
                api.setGridOption('columnDefs', columnDefs(i % 2 === 0));
                await asyncSetTimeout(0);
            }
            await settle();

            // Unspanned, each row's own b measures 200.
            await waitFor(() => expect([rowHeight(api, 0), rowHeight(api, 1)]).toEqual([200, 200]));

            api.setGridOption('columnDefs', columnDefs(true));
            await settle();

            // The run is 200 tall: row 0 keeps its own c, the last row takes what is left and no more.
            await waitFor(() => expect([rowHeight(api, 0), rowHeight(api, 1)]).toEqual([50, 150]));
        });

        // Pinned rows have span caches of their own, rebuilt on any change to their data, and a change that
        // moves no span must not set every row reconsidering its height.
        test('a pinned row changing a value no span depends on reconsiders no row', async () => {
            cellHeights.set('*:b', 90);
            let getRowHeightCalls = 0;
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'a' }, { field: 'b', spanRows: true, autoHeight: true }],
                enableCellSpan: true,
                rowData: rowData(10),
                pinnedTopRowData: [
                    { a: 'p0', b: 'x' },
                    { a: 'p1', b: 'x' },
                ],
                getRowHeight: () => {
                    ++getRowHeightCalls;
                    return DEFAULT_ROW_HEIGHT;
                },
            });
            await settle();
            await waitFor(() => expect(api.getPinnedTopRow(1)!.rowHeight).toBe(90 - DEFAULT_ROW_HEIGHT));
            await settle();

            getRowHeightCalls = 0;
            api.getPinnedTopRow(0)!.setDataValue('a', 'changed');
            // A spurious recheck would land three timers deep: the pinned rebuild, its event's debounce and
            // the pass. Nothing arrives to wait for when there is none, so drain that many hops instead.
            for (let hop = 0; hop < 4; ++hop) {
                await asyncSetTimeout(0);
            }
            await settle();

            expect(getRowHeightCalls).toBe(0);
        });

        // A spanned cell is taller than the row it is anchored to by design, so the scroll must not wait on it.
        test('a spanned row does not leave the scroll waiting for a measurement that never comes', async () => {
            // Without it the resize below reaches nothing, and nothing grows the rows it asserts on.
            const uninstallResizeObserver = installMockResizeObserver();
            try {
                cellHeights.set('*:b', 90);
                const api = gridsManager.createGrid('myGrid', {
                    columnDefs: [{ field: 'a' }, { field: 'b', spanRows: true, autoHeight: true }],
                    enableCellSpan: true,
                    // Runs of two, so a span covers a row beyond the one it is anchored to.
                    rowData: Array.from({ length: 200 }, (_, i) => ({ a: `a${i}`, b: `s${Math.floor(i / 2)}` })),
                    suppressRowVirtualisation: false,
                });
                await settle();
                await waitFor(() => expect(rowHeight(api, 1)).toBeGreaterThan(DEFAULT_ROW_HEIGHT));

                api.ensureIndexVisible(150, 'top');
                await settle();

                // Growing the rendered rows shifts the target down the viewport with no scroll event. A scroll
                // still waiting to be told the rows are measured re-pins the target to the top instead, both
                // when the heights change and again on the next model update.
                cellHeights.set('*:b', 140);
                triggerResizeObservers();
                await settle();
                const offset = api.getDisplayedRowAtIndex(150)!.rowTop! - api.getVerticalPixelRange().top;
                expect(offset).not.toBe(0);

                // Appended, so the model updates without moving the target itself.
                api.applyTransaction({ add: [{ a: 'appended', b: 'appended' }] });
                await waitFor(() => expect(api.getDisplayedRowCount()).toBe(201));
                await settle();

                expect(api.getDisplayedRowAtIndex(150)!.rowTop! - api.getVerticalPixelRange().top).toBe(offset);
            } finally {
                uninstallResizeObserver();
            }
        });
    });

    // A row caps its line height against the height the grid is configured to give it, never against the
    // height auto height grew it to: the taller row would take a line height with it and grow the cell
    // that measured it, and so on.
    test('a measured row caps its line height against its configured height', async () => {
        cellHeights.set('0:b', 90);
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b', autoHeight: true }],
            rowData: rowData(1),
            getRowHeight: () => 30,
        });
        await waitFor(() => expect(rowHeight(api, 0)).toBe(90));

        // `min(default 42, configured 30) - 2`, rather than the 40 the measured 90 would cap to.
        expect(rowElement(0).style.getPropertyValue('--ag-line-height')).toBe('28px');
    });

    // Scrolling to a row that has never been measured moves the target while the scroll is happening: the
    // rows coming into view grow from the configured height to their measured one. The scroll retries until
    // the rows it passed have been measured, so the row it was asked for ends up where it was asked for.
    test('scrolling to a row lands on it even though measuring it moves it', async () => {
        cellHeights.set('*:b', 90);
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b', autoHeight: true }],
            rowData: rowData(200),
            suppressRowVirtualisation: false,
        });
        await waitFor(() => expect(rowHeight(api, 0)).toBe(90));

        api.ensureIndexVisible(150, 'top');

        await waitFor(() => {
            expect(rowHeight(api, 150)).toBe(90);
            expect(api.getDisplayedRowAtIndex(150)!.rowTop).toBe(api.getVerticalPixelRange().top);
        });
    });

    // A resize the browser reports is applied a timer later, as resizing inside its callback is refused:
    // a scroll taken in between waits for the pass, though every cell already looks measured.
    test('a scroll taken before a reported height is applied waits for it', async () => {
        const uninstallResizeObserver = installMockResizeObserver();
        try {
            cellHeights.set('*:b', 90);
            // Every row rendered, so the scroll brings no new cell on screen to wait on.
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'a' }, { field: 'b', autoHeight: true }],
                rowData: rowData(30),
                suppressRowVirtualisation: true,
            });
            await waitFor(() => expect(rowHeight(api, 29)).toBe(90));
            await settle();

            cellHeights.set('*:b', 150);
            for (const wrapper of document.querySelectorAll('#myGrid .ag-cell-wrapper')) {
                triggerResizeObservers(wrapper);
            }
            expect(rowHeight(api, 9)).toBe(90);

            api.ensureIndexVisible(10, 'top');
            await waitFor(() => expect(rowHeight(api, 9)).toBe(150));
            await settle();

            expect(api.getDisplayedRowAtIndex(10)!.rowTop! - api.getVerticalPixelRange().top).toBe(0);
        } finally {
            uninstallResizeObserver();
        }
    });

    // A loading row stands in for data not there yet: whatever its skeleton cells measure says nothing about
    // the row, so auto height leaves it alone, through a full recheck too, and sizes the rows that replace it.
    test('loading rows are not sized by auto height, and the rows that replace them are', async () => {
        cellHeights.set('*:b', 90);
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b', colId: 'b', autoHeight: true }],
            loading: true,
            loadingRows: { rowCount: 5 },
        });
        await waitFor(() => expect(api.getDisplayedRowCount()).toBe(5));
        const heights = () => [0, 1, 2, 3, 4].map((i) => rowHeight(api, i));
        await settle();
        expect(heights()).toEqual([42, 42, 42, 42, 42]);

        // A column change reconsiders every rendered row, the loading ones included.
        api.setColumnsVisible(['b'], false);
        api.setColumnsVisible(['b'], true);
        await settle();
        expect(heights()).toEqual([42, 42, 42, 42, 42]);

        api.updateGridOptions({ loading: false, rowData: rowData(5) });
        await waitFor(() => expect(heights()).toEqual([90, 90, 90, 90, 90]));
    });

    // A grid can be built before it is put in the page: its cells have no size until they are attached.
    test('a grid built before it is attached measures its rows once it is', async () => {
        cellHeights.set('*:b', 90);
        const eGridDiv = document.createElement('div');
        const api = gridsManager.createGrid(eGridDiv, {
            columnDefs: [{ field: 'a' }, { field: 'b', autoHeight: true }],
            rowData: rowData(2),
        });
        // Its first measurement finds the cells out of the document, where they have no size.
        await Promise.resolve();
        expect(rowHeight(api, 0)).toBe(DEFAULT_ROW_HEIGHT);
        document.body.appendChild(eGridDiv);
        try {
            await waitFor(() => expect([rowHeight(api, 0), rowHeight(api, 1)]).toEqual([90, 90]));
        } finally {
            eGridDiv.remove();
        }
    });

    // The user scrolling away cancels a scroll still waiting on the rows: the measurements it waited for
    // must not pull the viewport back to a target the user has left.
    test('scrolling away cancels a scroll still waiting on the rows', async () => {
        // Nothing to measure yet, which is retried over several tasks: the scroll waits through them.
        cellHeights.set('*:b', 0);
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b', autoHeight: true }],
            rowData: rowData(200),
            suppressRowVirtualisation: false,
        });
        await settle();

        api.ensureIndexVisible(150, 'top');
        await asyncSetTimeout(0);
        const viewport = document.querySelector<HTMLElement>('#myGrid .ag-grid-viewport')!;
        viewport.scrollTop = 0;
        viewport.dispatchEvent(new Event('scroll'));
        await settle();
        await settle();

        expect(api.getVerticalPixelRange().top).toBe(0);
    });

    // A scroll waiting on the rows gives up once its target is no longer there to scroll to.
    test('a scroll waiting on the rows stops when its target row goes', async () => {
        const warn = vi.spyOn(console, 'warn');
        try {
            cellHeights.set('*:b', 90);
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'a' }, { field: 'b', autoHeight: true }],
                rowData: rowData(200),
                suppressRowVirtualisation: false,
            });
            await settle();

            api.ensureIndexVisible(150, 'top');
            api.setGridOption('rowData', rowData(10));
            await settle();

            expect(api.getDisplayedRowCount()).toBe(10);
            expect(warn).not.toHaveBeenCalled();
        } finally {
            warn.mockRestore();
        }
    });

    // A resize that leaves a cell the height it was reports nothing, so no row is reconsidered for it.
    test('a resize that leaves a cell the same height reconsiders no row', async () => {
        const uninstallResizeObserver = installMockResizeObserver();
        try {
            cellHeights.set('*:b', 90);
            let getRowHeightCalls = 0;
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'a' }, { field: 'b', autoHeight: true }],
                rowData: rowData(5),
                getRowHeight: () => {
                    ++getRowHeightCalls;
                    return DEFAULT_ROW_HEIGHT;
                },
            });
            await waitFor(() => expect(rowHeight(api, 0)).toBe(90));
            await settle();

            getRowHeightCalls = 0;
            triggerResizeObservers();
            await settle();

            expect(getRowHeightCalls).toBe(0);

            // The same resize reaches the cells: one that did change is reconsidered.
            cellHeights.set('*:b', 100);
            triggerResizeObservers();
            await waitFor(() => expect(rowHeight(api, 0)).toBe(100));
            expect(getRowHeightCalls).toBeGreaterThan(0);
        } finally {
            uninstallResizeObserver();
        }
    });

    // Without a ResizeObserver nothing watches a cell, but each is still measured once as it is rendered.
    test('a grid with no ResizeObserver still measures each cell once', async () => {
        const original = window.ResizeObserver;
        Object.defineProperty(window, 'ResizeObserver', { value: undefined, configurable: true, writable: true });
        try {
            cellHeights.set('*:b', 90);
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'a' }, { field: 'b', autoHeight: true }],
                rowData: rowData(3),
            });

            await waitFor(() => expect([0, 1, 2].map((i) => rowHeight(api, i))).toEqual([90, 90, 90]));
        } finally {
            Object.defineProperty(window, 'ResizeObserver', { value: original, configurable: true, writable: true });
        }
    });

    // Auto height settling while the target's block loads wakes the scroll too, and the rows loading above
    // the target move it: the scroll still has to end on the target.
    test('a scroll to a row still loading lands on it once the rows above it have loaded', async () => {
        cellHeights.set('*:b', 90);
        const rows = Array.from({ length: 100 }, (_, i) => ({ a: `a${i}`, b: `b${i}` }));
        const pending: IServerSideGetRowsParams[] = [];
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b', autoHeight: true }],
            rowModelType: 'serverSide',
            cacheBlockSize: 10,
            serverSideDatasource: {
                getRows: (params) => {
                    if (params.request.startRow === 0) {
                        params.success({ rowData: rows.slice(0, 10), rowCount: rows.length });
                    } else {
                        pending.push(params);
                    }
                },
            },
            suppressRowVirtualisation: false,
        });
        await waitFor(() => expect(rowHeight(api, 0)).toBe(90));

        api.ensureIndexVisible(50, 'top');
        await waitFor(() => expect(pending.length).toBeGreaterThan(0));

        while (pending.length) {
            for (const params of pending.splice(0)) {
                const { startRow, endRow } = params.request;
                params.success({ rowData: rows.slice(startRow!, endRow!), rowCount: rows.length });
            }
            await settle();
        }
        await waitFor(() => expect(rowHeight(api, 49)).toBe(90));
        await settle();

        expect(api.getVerticalPixelRange().top).toBe(api.getDisplayedRowAtIndex(50)!.rowTop);
    });

    // The height a cell reports is its wrapper plus whatever the cell puts around it, so a row has to be
    // tall enough to hold both. Read at the moment of measuring rather than carried from an earlier
    // attempt: a cell not yet in the document reports no padding at all.
    test('a row is tall enough for its cell padding as well as its content', async () => {
        cellHeights.set('0:b', 90);
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'a' },
                { field: 'b', autoHeight: true, cellStyle: { paddingTop: '10px', paddingBottom: '6px' } },
            ],
            rowData: rowData(1),
        });

        await waitFor(() => expect(rowHeight(api, 0)).toBe(106));
    });

    test('a column turned auto-height after the grid is built measures its rows', async () => {
        cellHeights.set('0:b', 95);
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            rowData: rowData(1),
        });
        await asyncSetTimeout(0);
        expect(rowHeight(api, 0)).toBe(DEFAULT_ROW_HEIGHT);

        api.setGridOption('columnDefs', [{ field: 'a' }, { field: 'b', autoHeight: true }]);

        await waitFor(() => expect(rowHeight(api, 0)).toBe(95));
    });
});

/** The same contract, with the height supplied to the element a cell measures once it is rendered. */
describe('Auto row height, measured after the cell renders', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule, RowAutoHeightModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const measure = (api: GridApi, rowIndex: number, colId: string, height: number): void => {
        const cell = getGridElement(api)!.querySelector(`[row-index="${rowIndex}"] [col-id="${colId}"]`);
        expect(cell).not.toBeNull();
        Object.defineProperty(cell!.firstElementChild, 'offsetHeight', { value: height, configurable: true });
    };

    const rowHeight = (api: GridApi, rowIndex: number): number => api.getDisplayedRowAtIndex(rowIndex)!.rowHeight!;

    test('a row takes the height of its auto-height cell', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'a', colId: 'a' },
                { field: 'b', colId: 'b', autoHeight: true },
            ],
            rowData: [{ a: 'a0', b: 'b0' }],
        });
        const before = rowHeight(api, 0);
        measure(api, 0, 'b', 90);
        await waitFor(() => expect(rowHeight(api, 0)).toBeGreaterThanOrEqual(90));
        expect(before).toBeLessThan(90);
    });

    // A hidden column has no cell, so nothing of it is left to measure and the row loses the height it
    // was holding for it.
    test('hiding the auto-height column releases the height it held', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'a', colId: 'a' },
                { field: 'b', colId: 'b', autoHeight: true },
            ],
            rowData: [{ a: 'a0', b: 'b0' }],
        });
        measure(api, 0, 'b', 110);
        await waitFor(() => expect(rowHeight(api, 0)).toBeGreaterThanOrEqual(110));

        api.setColumnsVisible(['b'], false);
        await waitFor(() => expect(rowHeight(api, 0)).toBeLessThan(110));
    });
});
