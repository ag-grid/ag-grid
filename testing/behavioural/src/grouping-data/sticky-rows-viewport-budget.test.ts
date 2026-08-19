import { waitFor } from '@testing-library/dom';
import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';

import { ClientSideRowModelApiModule, ClientSideRowModelModule, RowAutoHeightModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

// Sticky rows overlay the viewport, so each sticky section (top/bottom) is capped to
// stickyRowsMaxViewportRatio of the viewport height (default 0.5). The behavioural
// viewport is 770px tall (mockGridLayout: gridHeight 800, headerHeight 30), giving a
// 385px default budget per section. Rows are sized with node.setRowHeight +
// onRowHeightChanged so heights are real, never estimated.
describe('ag-grid sticky rows viewport budget', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ClientSideRowModelApiModule, RowAutoHeightModule, RowGroupingModule],
    });

    beforeAll(() => {
        // The sticky budget is viewport-aware; happy-dom offset dimensions are 0 by default
        // which makes the budget zero and disables sticky rows entirely.
        mockGridLayout.useRealOffsetDimensions = true;
    });

    afterAll(() => {
        mockGridLayout.useRealOffsetDimensions = false;
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    function stickyRowIds(container: HTMLElement): string[] {
        return Array.from(container.querySelectorAll('.ag-row')).map((row) => row.getAttribute('row-id') ?? '');
    }

    function makeRowData(groups: string[], childrenPerGroup: number): { id: string; group: string; value: number }[] {
        const rowData: { id: string; group: string; value: number }[] = [];
        for (const group of groups) {
            for (let i = 0; i < childrenPerGroup; i++) {
                rowData.push({ id: `${group}-${i}`, group, value: i });
            }
        }
        return rowData;
    }

    test('a total row taller than the sticky budget never sticks, while normal group rows still do', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'group', rowGroup: true, hide: true }, { field: 'value' }],
            autoGroupColumnDef: { headerName: 'Group' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupTotalRow: 'bottom',
            getRowId: (params) => params.data.id,
            rowData: makeRowData(['A', 'B'], 24),
        });
        await asyncSetTimeout(0);

        // 2 group rows + 48 leaves + 2 footers
        expect(api.getDisplayedRowCount()).toBe(52);

        // group A footer (displayed after the group row and its 24 leaves)
        const footerNode = api.getDisplayedRowAtIndex(25)!;
        expect(footerNode.footer).toBe(true);
        footerNode.setRowHeight(700);
        api.onRowHeightChanged();

        const root = TestGridsManager.getHTMLElement(api)!;
        const viewport = root.querySelector<HTMLElement>('.ag-grid-viewport')!;
        const stickyTopContainer = root.querySelector<HTMLElement>('.ag-grid-sticky-top-rows-container')!;
        const stickyBottomContainer = root.querySelector<HTMLElement>('.ag-grid-sticky-bottom-rows-container')!;

        // inside group A's leaves: the 42px group row sticks top as usual, but the 700px
        // footer must not stick bottom — it is taller than the 385px budget
        viewport.scrollTop = 600;
        await waitFor(() => expect(stickyRowIds(stickyTopContainer)).toEqual(['row-group-group-A']));
        await waitFor(() => expect(stickyRowIds(stickyBottomContainer)).toEqual([]));

        // the oversized footer is still reachable as a normal in-flow row
        // (group A spans 42 + 24 * 42 = 1050px, then the footer up to 1750px)
        viewport.scrollTop = 1000;
        await waitFor(() =>
            expect(
                root.querySelector('.ag-grid-scrolling-container .ag-row[row-id="rowGroupFooter_row-group-group-A"]')
            ).not.toBeNull()
        );
        expect(stickyRowIds(stickyBottomContainer)).toEqual([]);
    });

    test('a group row taller than the sticky budget never sticks top, independently per group', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'group', rowGroup: true, hide: true }, { field: 'value' }],
            autoGroupColumnDef: { headerName: 'Group' },
            animateRows: false,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
            rowData: makeRowData(['A', 'B'], 24),
        });
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowCount()).toBe(50);

        api.getDisplayedRowAtIndex(0)!.setRowHeight(500);
        api.onRowHeightChanged();

        const root = TestGridsManager.getHTMLElement(api)!;
        const viewport = root.querySelector<HTMLElement>('.ag-grid-viewport')!;
        const stickyTopContainer = root.querySelector<HTMLElement>('.ag-grid-sticky-top-rows-container')!;

        // group A: 500px group row + 24 * 42px leaves, spanning up to 1508px. Scrolled
        // inside its leaves, B-5 (at 1760px) entering the render range proves the redraw
        // for this position completed; the 500px group row must not have stuck.
        viewport.scrollTop = 900;
        await waitFor(() =>
            expect(root.querySelector('.ag-grid-scrolling-container .ag-row[row-id="B-5"]')).not.toBeNull()
        );
        expect(stickyRowIds(stickyTopContainer)).toEqual([]);

        // inside group B's leaves (group B row spans 1508..1550px) the normal 42px group
        // row sticks as usual
        viewport.scrollTop = 1700;
        await waitFor(() => expect(stickyRowIds(stickyTopContainer)).toEqual(['row-group-group-B']));
    });

    test('nested group rows stop sticking once the accumulated sticky height exceeds the budget', async () => {
        const rowData = Array.from({ length: 24 }, (_, i) => ({
            id: `${i}`,
            g1: 'A',
            g2: 'B',
            g3: 'C',
            value: i,
        }));

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'g1', rowGroup: true, hide: true },
                { field: 'g2', rowGroup: true, hide: true },
                { field: 'g3', rowGroup: true, hide: true },
                { field: 'value' },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            animateRows: false,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
            rowData,
        });
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowCount()).toBe(27);

        const level0 = api.getDisplayedRowAtIndex(0)!;
        const level1 = api.getDisplayedRowAtIndex(1)!;
        const level2 = api.getDisplayedRowAtIndex(2)!;

        const root = TestGridsManager.getHTMLElement(api)!;
        const viewport = root.querySelector<HTMLElement>('.ag-grid-viewport')!;
        const stickyTopContainer = root.querySelector<HTMLElement>('.ag-grid-sticky-top-rows-container')!;

        // with default 42px heights all three ancestors fit the budget and stick
        viewport.scrollTop = 350;
        await waitFor(() => {
            const ids = stickyRowIds(stickyTopContainer);
            expect(new Set(ids)).toEqual(new Set([level0.id!, level1.id!, level2.id!]));
        });

        // at 160px each the third ancestor would take the container to 480px, past the
        // 385px budget: only the two outermost stick, deterministically
        level0.setRowHeight(160);
        level1.setRowHeight(160);
        level2.setRowHeight(160);
        api.onRowHeightChanged();
        await waitFor(() => {
            const ids = stickyRowIds(stickyTopContainer);
            expect(new Set(ids)).toEqual(new Set([level0.id!, level1.id!]));
        });
    });

    test('a sticky total row is evicted when its height grows beyond the budget', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'group', rowGroup: true, hide: true }, { field: 'value' }],
            autoGroupColumnDef: { headerName: 'Group' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupTotalRow: 'bottom',
            getRowId: (params) => params.data.id,
            rowData: makeRowData(['A', 'B'], 24),
        });
        await asyncSetTimeout(0);

        const root = TestGridsManager.getHTMLElement(api)!;
        const stickyBottomContainer = root.querySelector<HTMLElement>('.ag-grid-sticky-bottom-rows-container')!;

        // group A spans past the viewport bottom, so its normal-height footer sticks
        await waitFor(() => expect(stickyRowIds(stickyBottomContainer)).toEqual(['rowGroupFooter_row-group-group-A']));

        // the same situation an autoHeight re-measure produces: the already-sticky row
        // becomes taller than the budget and must be evicted on the next evaluation
        const footerNode = api.getDisplayedRowAtIndex(25)!;
        expect(footerNode.footer).toBe(true);
        footerNode.setRowHeight(700);
        api.onRowHeightChanged();
        await waitFor(() => expect(stickyRowIds(stickyBottomContainer)).toEqual([]));
    });

    test('autoHeight measurement of a sticky total row evicts it once it grows beyond the budget', async () => {
        // simulate wrapped text: the footer's group cell wrapper measures 700px tall,
        // every other group cell wrapper measures the default 42px
        mockGridLayout.elementHeightOverride = (el) => {
            if (!el.classList.contains('ag-cell-wrapper')) {
                return undefined;
            }
            if (el.closest('.ag-cell')?.getAttribute('col-id') !== 'ag-Grid-AutoColumn') {
                return undefined;
            }
            const rowId = el.closest('.ag-row')?.getAttribute('row-id');
            return rowId === 'rowGroupFooter_row-group-group-A' ? 700 : 42;
        };
        try {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'group', rowGroup: true, hide: true }, { field: 'value' }],
                autoGroupColumnDef: { headerName: 'Group', autoHeight: true, wrapText: true },
                animateRows: false,
                groupDefaultExpanded: -1,
                groupTotalRow: 'bottom',
                getRowId: (params) => params.data.id,
                rowData: makeRowData(['A', 'B'], 24),
            });
            await asyncSetTimeout(0);

            const root = TestGridsManager.getHTMLElement(api)!;
            const stickyBottomContainer = root.querySelector<HTMLElement>('.ag-grid-sticky-bottom-rows-container')!;

            // the footer initially sticks at its default height; rendering it runs the real
            // autoHeight measurement, which grows it past the budget and must evict it
            const footerNode = api.getDisplayedRowAtIndex(25)!;
            expect(footerNode.footer).toBe(true);
            await waitFor(() => expect(footerNode.rowHeight).toBe(700));
            await waitFor(() => expect(stickyRowIds(stickyBottomContainer)).toEqual([]));

            // the measurement drove only the footer: its group row kept the default height
            expect(api.getDisplayedRowAtIndex(0)!.rowHeight).toBe(42);
        } finally {
            mockGridLayout.elementHeightOverride = undefined;
        }
    });

    test('stickyRowsMaxViewportRatio is honoured and reactive', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'group', rowGroup: true, hide: true }, { field: 'value' }],
            autoGroupColumnDef: { headerName: 'Group' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupTotalRow: 'bottom',
            stickyRowsMaxViewportRatio: 1,
            getRowId: (params) => params.data.id,
            rowData: makeRowData(['A', 'B'], 24),
        });
        await asyncSetTimeout(0);

        const footerNode = api.getDisplayedRowAtIndex(25)!;
        expect(footerNode.footer).toBe(true);
        footerNode.setRowHeight(700);
        api.onRowHeightChanged();

        const root = TestGridsManager.getHTMLElement(api)!;
        const stickyBottomContainer = root.querySelector<HTMLElement>('.ag-grid-sticky-bottom-rows-container')!;

        // with the whole viewport (770px) as budget the 700px footer is allowed to stick
        await waitFor(() => expect(stickyRowIds(stickyBottomContainer)).toEqual(['rowGroupFooter_row-group-group-A']));

        // tightening the ratio at runtime evicts it on the next evaluation
        api.setGridOption('stickyRowsMaxViewportRatio', 0.5);
        await waitFor(() => expect(stickyRowIds(stickyBottomContainer)).toEqual([]));
    });
});
