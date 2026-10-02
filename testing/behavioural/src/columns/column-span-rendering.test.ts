import { waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { GridRows, TestGridsManager, asyncSetTimeout } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import { installMockResizeObserver } from 'ag-test-utils/polyfills/mockResizeObserver';

import type { ColDef, GridApi } from 'ag-grid-community';
import {
    CellStyleModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    InfiniteRowModelModule,
    PinnedRowModule,
    RenderApiModule,
    RowAutoHeightModule,
    ScrollApiModule,
    TextEditorModule,
    getGridElement,
} from 'ag-grid-community';
import { BatchEditModule, CellSelectionModule, RowGroupingModule } from 'ag-grid-enterprise';

interface RowData {
    a: string;
    b: string;
    c: string;
}

/** The row's drawn cells, as `colId:width`. */
const renderedRow = (api: GridApi, rowIndex: number | string) => {
    const cells = Array.from(
        getGridElement(api)!.querySelectorAll<HTMLElement>(`.ag-row[row-index="${rowIndex}"] .ag-cell`)
    );
    return cells.map((cell) => `${cell.getAttribute('col-id')}:${cell.style.width}`).join(' ');
};

describe('Legacy colSpan rendering', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    // Columns a and b are each 100px. Row 1 has col 'a' spanning over 'b'.
    const columnDefs: ColDef<RowData>[] = [
        {
            field: 'a',
            colId: 'a',
            width: 100,
            colSpan: (params) => (params.node!.rowIndex === 1 ? 2 : 1),
        },
        { field: 'b', colId: 'b', width: 100 },
        { field: 'c', colId: 'c', width: 100 },
    ];

    const rowData: RowData[] = [
        { a: 'a0', b: 'b0', c: 'c0' },
        { a: 'a1', b: 'b1', c: 'c1' },
    ];

    test('a spanning cell is as wide as the columns it covers, which draw no cell', async () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs, rowData });
        expect([renderedRow(api, 0), renderedRow(api, 1)]).toEqual(['a:100px b:100px c:100px', 'a:200px c:100px']);
        await new GridRows(api, 'a spanning cell').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"a0" b:"b0" c:"c0"
            └── LEAF id:1 a:"a1" b:"b1" c:"c1"
        `);
    });

    test('print layout drops the covered cell, and stops a span at the pinned lane edge', async () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs, rowData, domLayout: 'print' });
        await waitFor(() => expect(renderedRow(api, 1)).toBe('a:200px c:100px'));
        expect(renderedRow(api, 0)).toBe('a:100px b:100px c:100px');

        api.setGridOption('columnDefs', [{ ...columnDefs[0], pinned: 'left' }, columnDefs[1], columnDefs[2]]);
        await waitFor(() => expect(renderedRow(api, 1)).toBe('a:100px b:100px c:100px'));
    });

    test('a span keyed on the row index follows rows reordered by rowData, then by a header click sort', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ ...columnDefs[0], sortable: true }, columnDefs[1], columnDefs[2]],
            rowData,
            getRowId: (params) => params.data.a,
        });
        const gridEl = getGridElement(api)!;
        const rowById = (id: string) =>
            Array.from(gridEl.querySelectorAll<HTMLElement>(`.ag-row[row-id="${id}"] .ag-cell`))
                .map((cell) => `${cell.getAttribute('col-id')}:${cell.style.width}`)
                .join(' ');
        await waitFor(() => expect(rowById('a1')).toBe('a:200px c:100px'));
        expect(rowById('a0')).toBe('a:100px b:100px c:100px');

        // no data or column change, only the order
        api.setGridOption('rowData', [rowData[1], rowData[0]]);
        await waitFor(() => expect(rowById('a0')).toBe('a:200px c:100px'));
        expect(rowById('a1')).toBe('a:100px b:100px c:100px');

        const user = userEvent.setup({ skipHover: true });
        await user.click(gridEl.querySelector<HTMLElement>('.ag-header-cell[col-id="a"] .ag-header-cell-label')!);
        await waitFor(() => expect(rowById('a1')).toBe('a:200px c:100px'));
        expect(rowById('a0')).toBe('a:100px b:100px c:100px');
    });

    test('hiding a spanning column draws the columns it covered at their own width, and showing it draws the span again', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ ...columnDefs[0], hide: true }, columnDefs[1], columnDefs[2]],
            rowData,
        });
        const hiddenAtStart = renderedRow(api, 1);
        api.setColumnsVisible(['a'], true);
        const shown = renderedRow(api, 1);
        api.setColumnsVisible(['a'], false);

        expect({ hiddenAtStart, shown, hiddenAgain: renderedRow(api, 1) }).toEqual({
            hiddenAtStart: 'b:100px c:100px',
            shown: 'a:200px c:100px',
            hiddenAgain: 'b:100px c:100px',
        });
    });

    test('showing a spanning column over the focused cell draws the span beneath it', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ ...columnDefs[0], hide: true }, columnDefs[1], columnDefs[2]],
            rowData,
            ensureDomOrder: false,
        });
        await waitFor(() => expect(renderedRow(api, 1)).toBe('b:100px c:100px'));
        api.setFocusedCell(1, 'b');
        await waitFor(() => expect(document.activeElement?.getAttribute('col-id')).toBe('b'));
        api.setColumnsVisible(['a'], true);

        expect(renderedRow(api, 1)).toBe('a:200px b:100px c:100px');
        expect(document.activeElement?.getAttribute('col-id')).toBe('b');
    });

    test('columns shown on both sides of a drawn cell are drawn in column order', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a', hide: true }, { field: 'b' }, { field: 'c', hide: true }],
            rowData,
            ensureDomOrder: false,
        });
        expect(renderedRow(api, 0)).toBe('b:200px');

        api.setColumnsVisible(['a', 'c'], true);

        expect(renderedRow(api, 0)).toBe('a:200px b:200px c:200px');
    });

    test('a column a span covers starts no cell, so its own colSpan is ignored', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ ...columnDefs[0], colSpan: () => 2 }, { ...columnDefs[1], colSpan: () => 2 }, columnDefs[2]],
            rowData,
        });

        expect(renderedRow(api, 0)).toBe('a:200px c:100px');
        await new GridRows(api, 'a column a span covers starts no cell').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"a0" b:"b0" c:"c0"
            └── LEAF id:1 a:"a1" b:"b1" c:"c1"
        `);
    });
});

describe('colSpan follows row data updates', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            BatchEditModule,
            CellSelectionModule,
            ClientSideRowModelModule,
            InfiniteRowModelModule,
            CellStyleModule,
            PinnedRowModule,
            RenderApiModule,
            RowAutoHeightModule,
            RowGroupingModule,
            ScrollApiModule,
            TextEditorModule,
        ],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    interface PriceRow {
        id: string;
        price: number;
        symbol: string;
        group: string;
    }

    const priceColumnDefs: ColDef<PriceRow>[] = [
        {
            field: 'price',
            width: 100,
            colSpan: (params) => (params.data ? params.data.price + 1 : 1),
        },
        { field: 'symbol', width: 100 },
        { field: 'group', width: 100 },
    ];

    const priceStyle = (api: GridApi, rowIndex: number) =>
        getGridElement(api)!.querySelector<HTMLElement>(`[row-index="${rowIndex}"] [col-id="price"]`)!.style
            .backgroundColor;

    test('a span grows and shrinks with the data, through every client-side update path', async () => {
        const unspannedRow0 = (): PriceRow[] => [
            { id: 'r0', price: 0, symbol: 'AAA', group: 'A' },
            { id: 'r1', price: 2, symbol: 'BBB', group: 'A' },
        ];
        const spannedRow0 = (): PriceRow[] => [
            { id: 'r0', price: 1, symbol: 'AAA', group: 'A' },
            { id: 'r1', price: 0, symbol: 'BBB', group: 'A' },
        ];
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                {
                    ...priceColumnDefs[0],
                    cellStyle: (params) => ({ backgroundColor: params.value === 0 ? 'white' : 'blue' }),
                },
                priceColumnDefs[1],
                priceColumnDefs[2],
            ],
            rowData: unspannedRow0(),
            getRowId: (params) => params.data.id,
        });

        // the step rides along in the compared object, so a failure names the update path that broke
        const expectRendered = async (spanned: boolean, step: string) => {
            await waitFor(() =>
                expect({ step, row0: renderedRow(api, 0) }).toEqual({
                    step,
                    row0: spanned ? 'price:200px group:100px' : 'price:100px symbol:100px group:100px',
                })
            );
            expect({ step, row1: renderedRow(api, 1), styles: [priceStyle(api, 0), priceStyle(api, 1)] }).toEqual({
                step,
                row1: spanned ? 'price:100px symbol:100px group:100px' : 'price:300px',
                styles: spanned ? ['blue', 'white'] : ['white', 'blue'],
            });
        };

        await expectRendered(false, 'initial');

        api.setGridOption('rowData', spannedRow0());
        await expectRendered(true, 'rowData with getRowId');

        api.applyTransaction({ update: unspannedRow0() });
        await expectRendered(false, 'applyTransaction update');

        for (const row of spannedRow0()) {
            api.getRowNode(row.id)!.setData(row);
        }
        await expectRendered(true, 'node.setData');

        for (const row of unspannedRow0()) {
            api.getRowNode(row.id)!.setDataValue('price', row.price);
        }
        await expectRendered(false, 'node.setDataValue');

        for (const row of spannedRow0()) {
            api.getRowNode(row.id)!.data!.price = row.price;
        }
        api.refreshCells({ rowNodes: [api.getRowNode('r0')!, api.getRowNode('r1')!] });
        await expectRendered(true, 'data mutated in place, then refreshCells for those rows');

        for (const row of unspannedRow0()) {
            api.getRowNode(row.id)!.data!.price = row.price;
        }
        api.refreshCells();
        await expectRendered(false, 'data mutated in place, then refreshCells for every row');
    });

    test('a group row and its footer span by their aggregates', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                {
                    field: 'gold',
                    width: 100,
                    aggFunc: 'sum',
                    colSpan: (params) =>
                        (params.node?.group || params.node?.footer) && params.node.aggData?.gold > 5 ? 2 : 1,
                },
                { field: 'silver', width: 100 },
                { field: 'bronze', width: 100 },
            ],
            autoGroupColumnDef: { width: 100 },
            groupTotalRow: 'bottom',
            groupDefaultExpanded: -1,
            rowData: [{ id: 'l0', country: 'X', gold: 3, silver: 1, bronze: 1 }],
            getRowId: (params) => params.data.id,
        });
        // the footer is a sibling node, refreshed by its own cellChanged
        const groupAndFooter = () => [renderedRow(api, 0), renderedRow(api, 2)];
        const unspanned = 'ag-Grid-AutoColumn:100px gold:100px silver:100px bronze:100px';
        await waitFor(() => expect(groupAndFooter()).toEqual([unspanned, unspanned]));

        api.applyTransaction({ update: [{ id: 'l0', country: 'X', gold: 10, silver: 1, bronze: 1 }] });
        const spanned = 'ag-Grid-AutoColumn:100px gold:200px bronze:100px';
        await waitFor(() => expect(groupAndFooter()).toEqual([spanned, spanned]));
    });

    test('a sticky group row spans by its aggregates, like the row it stands in for', async () => {
        mockGridLayout.useRealOffsetDimensions = true;
        try {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    {
                        field: 'gold',
                        width: 100,
                        aggFunc: 'sum',
                        colSpan: (params) => (params.node?.group && params.node.aggData?.gold > 5 ? 2 : 1),
                    },
                    { field: 'silver', width: 100 },
                    { field: 'bronze', width: 100 },
                ],
                autoGroupColumnDef: { width: 100 },
                groupDefaultExpanded: -1,
                rowData: Array.from({ length: 40 }, (_, i) => ({
                    id: `l${i}`,
                    country: 'X',
                    gold: 0,
                    silver: 1,
                    bronze: 1,
                })),
                getRowId: (params) => params.data.id,
            });
            const gridElement = getGridElement(api)!;
            const stickyRow = () =>
                Array.from(
                    gridElement.querySelectorAll<HTMLElement>('.ag-grid-sticky-top-rows-container .ag-row .ag-cell')
                )
                    .map((cell) => `${cell.getAttribute('col-id')}:${cell.style.width}`)
                    .join(' ');
            await waitFor(() => expect(renderedRow(api, 0)).not.toBe(''));
            gridElement.querySelector<HTMLElement>('.ag-grid-viewport')!.scrollTop = 600;
            await waitFor(() =>
                expect(stickyRow()).toBe('ag-Grid-AutoColumn:100px gold:100px silver:100px bronze:100px')
            );

            api.applyTransaction({ update: [{ id: 'l0', country: 'X', gold: 10, silver: 1, bronze: 1 }] });
            await waitFor(() => expect(stickyRow()).toBe('ag-Grid-AutoColumn:100px gold:200px bronze:100px'));
        } finally {
            mockGridLayout.useRealOffsetDimensions = false;
        }
    });

    test('a legacy rowSpan grows and shrinks with the data', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'price', width: 100, rowSpan: (params) => (params.data ? params.data.price + 1 : 1) },
                { field: 'symbol', width: 100 },
            ],
            rowData: [
                { id: 'r0', price: 0, symbol: 'AAA', group: 'A' },
                { id: 'r1', price: 0, symbol: 'BBB', group: 'A' },
            ],
            getRowId: (params) => params.data.id,
            rowHeight: 30,
            suppressRowTransform: true,
        });
        const priceCell = () => getGridElement(api)!.querySelector<HTMLElement>('[row-index="0"] [col-id="price"]');
        const priceHeight = () => priceCell()?.style.height;
        await waitFor(() => expect(priceHeight()).toBe(''));

        api.getRowNode('r0')!.setDataValue('price', 1);
        await waitFor(() => expect(priceHeight()).toBe('60px'));
        expect(priceCell()!.style.zIndex).toBe('1');

        // back to one row, the cell sizes like its neighbours again
        api.applyTransaction({ update: [{ id: 'r0', price: 0, symbol: 'AAA', group: 'A' }] });
        await waitFor(() => expect(priceHeight()).toBe(''));
        expect(priceCell()!.style.zIndex).toBe('');

        api.getRowNode('r0')!.data!.price = 1;
        api.refreshCells();
        await waitFor(() => expect(priceHeight()).toBe('60px'));

        api.getRowNode('r0')!.setData({ id: 'r0', price: 0, symbol: 'AAA', group: 'A' });
        await waitFor(() => expect(priceHeight()).toBe(''));
    });

    test('a legacy rowSpan keyed on the row index follows the rows to their new indexes', async () => {
        const rowData = [
            { id: 'r0', price: 0, symbol: 'AAA', group: 'A' },
            { id: 'r1', price: 1, symbol: 'BBB', group: 'A' },
        ];
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'price', width: 100, rowSpan: (params) => (params.node!.rowIndex === 0 ? 2 : 1) },
                { field: 'symbol', width: 100 },
            ],
            rowData,
            getRowId: (params) => params.data.id,
            rowHeight: 30,
            suppressRowTransform: true,
        });
        const priceHeight = (id: string) =>
            getGridElement(api)!.querySelector<HTMLElement>(`[row-id="${id}"] [col-id="price"]`)?.style.height;
        await waitFor(() => expect(priceHeight('r0')).toBe('60px'));
        expect(priceHeight('r1')).toBe('');

        api.setGridOption('rowData', [rowData[1], rowData[0]]);
        await waitFor(() => expect(priceHeight('r1')).toBe('60px'));
        expect(priceHeight('r0')).toBe('');
    });

    test('adding and removing a legacy rowSpan through columnDefs resizes cells that are already rendered', async () => {
        const noSpan: ColDef[] = [
            { field: 'price', width: 100 },
            { field: 'symbol', width: 100 },
        ];
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: noSpan,
            rowData: [
                { id: 'r0', price: 1, symbol: 'AAA', group: 'A' },
                { id: 'r1', price: 2, symbol: 'BBB', group: 'A' },
            ],
            getRowId: (params) => params.data.id,
            rowHeight: 30,
            suppressRowTransform: true,
        });
        const priceCell = () => getGridElement(api)!.querySelector<HTMLElement>('[row-id="r0"] [col-id="price"]');
        await waitFor(() => expect(priceCell()!.style.height).toBe(''));
        const renderedCell = priceCell();

        api.setGridOption('columnDefs', [{ ...noSpan[0], rowSpan: () => 2 }, noSpan[1]]);
        await waitFor(() => expect(priceCell()!.style.height).toBe('60px'));
        expect(priceCell()).toBe(renderedCell);

        api.setGridOption('columnDefs', noSpan);
        await waitFor(() => expect(priceCell()!.style.height).toBe(''));
        expect(priceCell()).toBe(renderedCell);
    });

    test('adding and removing colSpan through columnDefs resizes cells that are already rendered', async () => {
        const noSpan: ColDef<PriceRow>[] = [
            { field: 'price', width: 100 },
            { field: 'symbol', width: 100 },
            { field: 'group', width: 100 },
        ];
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: noSpan,
            rowData: [{ id: 'r0', price: 1, symbol: 'AAA', group: 'A' }],
            getRowId: (params) => params.data.id,
        });
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:100px symbol:100px group:100px'));

        api.setGridOption('columnDefs', [noSpan[0], { ...noSpan[1], colSpan: () => 2 }, noSpan[2]]);
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:100px symbol:200px'));

        api.setGridOption('columnDefs', [
            { ...noSpan[0], colSpan: priceColumnDefs[0].colSpan },
            { ...noSpan[1], colSpan: () => 2 },
            noSpan[2],
        ]);
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:200px group:100px'));

        api.setGridOption('columnDefs', noSpan);
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:100px symbol:100px group:100px'));
    });

    test('a colSpan callback returning NaN or a fraction spans whole columns', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { ...priceColumnDefs[0], colSpan: (params) => params.data!.price },
                priceColumnDefs[1],
                priceColumnDefs[2],
            ],
            rowData: [
                { id: 'r0', price: NaN, symbol: 'AAA', group: 'A' },
                { id: 'r1', price: 2.5, symbol: 'BBB', group: 'A' },
            ],
            getRowId: (params) => params.data.id,
        });
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:100px symbol:100px group:100px'));
        expect(renderedRow(api, 1)).toBe('price:200px group:100px');
    });

    test('a data change runs the colSpan callback once for its row and keeps the cells whose columns did not move', async () => {
        const calls: string[] = [];
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                {
                    ...priceColumnDefs[0],
                    colSpan: (params) => {
                        calls.push(params.node!.id!);
                        return params.data ? params.data.price + 1 : 1;
                    },
                },
                priceColumnDefs[1],
                priceColumnDefs[2],
            ],
            rowData: [
                { id: 'r0', price: 0, symbol: 'AAA', group: 'A' },
                { id: 'r1', price: 0, symbol: 'BBB', group: 'A' },
            ],
            getRowId: (params) => params.data.id,
        });
        const row0 = api.getRowNode('r0')!;
        await waitFor(() => expect(renderedRow(api, 1)).toBe('price:100px symbol:100px group:100px'));
        const groupCell = () => getGridElement(api)!.querySelector('[row-index="0"] [col-id="group"]');
        const groupBefore = groupCell();

        // the changes a row receives in one frame share one layout
        calls.length = 0;
        row0.setDataValue('symbol', 'ZZZ');
        row0.setDataValue('group', 'Z');
        row0.setDataValue('price', 1);
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:200px group:100px'));
        expect(calls).toEqual(['r0']);
        expect(groupCell()).toBe(groupBefore);

        // navigating across the span reads the span the layout stored
        calls.length = 0;
        api.setFocusedCell(0, 'price');
        await userEvent.keyboard('{ArrowRight}');
        expect(api.getFocusedCell()?.column.getColId()).toBe('group');
        expect(calls).toEqual([]);

        calls.length = 0;
        row0.setDataValue('price', 0);
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:100px symbol:100px group:100px'));
        expect(calls).toEqual(['r0']);
    });

    test('a span growing over the focused cell keeps it rendered, short of the next cell, until focus moves on', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [priceColumnDefs[0], { ...priceColumnDefs[1], colSpan: () => 2 }, priceColumnDefs[2]],
            rowData: [
                { id: 'r0', price: 0, symbol: 'AAA', group: 'A' },
                { id: 'r1', price: 0, symbol: 'BBB', group: 'A' },
            ],
            getRowId: (params) => params.data.id,
        });
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:100px symbol:200px'));

        api.setFocusedCell(0, 'symbol');
        await waitFor(() => expect(document.activeElement?.getAttribute('col-id')).toBe('symbol'));
        api.getRowNode('r0')!.setDataValue('price', 1);
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:200px symbol:100px group:100px'));
        expect(api.getFocusedCell()).toMatchObject({ rowIndex: 0, column: api.getColumn('symbol') });
        expect(document.activeElement?.getAttribute('col-id')).toBe('symbol');
        await new GridRows(api, 'a covered cell kept for focus').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r0 price:1 symbol:"AAA" group:"A"
            └── LEAF id:r1 price:0 symbol:"BBB" group:"A"
        `);

        api.setFocusedCell(1, 'price');
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:200px group:100px'));
    });

    test('a pinned cell a span grows over stays kept for focus across a horizontal scroll, until focus moves on', async () => {
        const columnDefs: ColDef<PriceRow>[] = [
            { field: 'price', width: 100, pinned: 'left', colSpan: (params) => (params.data!.price > 0 ? 2 : 1) },
            { field: 'symbol', width: 100, pinned: 'left' },
        ];
        for (let i = 0; i < 120; ++i) {
            columnDefs.push({ colId: `c${i}`, valueGetter: () => i, width: 120 });
        }
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: [{ id: 'r0', price: 0, symbol: 'AAA', group: 'A' }],
            getRowId: (params) => params.data.id,
            suppressColumnVirtualisation: false,
        });
        const pinnedCell = (colId: string) =>
            getGridElement(api)!.querySelector<HTMLElement>(
                `.ag-row[row-index="0"] .ag-grid-pinned-left-cells [col-id="${colId}"]`
            );
        await waitFor(() => expect(pinnedCell('symbol')).not.toBeNull());

        api.setFocusedCell(0, 'symbol');
        api.getRowNode('r0')!.setDataValue('price', 1);
        await waitFor(() => expect(pinnedCell('price')?.style.width).toBe('200px'));
        expect(pinnedCell('symbol')).not.toBeNull();

        api.ensureColumnVisible('c60');
        await waitFor(() =>
            expect(getGridElement(api)!.querySelector('[row-index="0"] [col-id="c60"]')).not.toBeNull()
        );
        expect(pinnedCell('symbol')).not.toBeNull();

        api.setFocusedCell(0, 'c60');
        await waitFor(() => expect(pinnedCell('symbol')).toBeNull());
    });

    test('a row index change lays a row out once, dropping the kept cell focus no longer holds', async () => {
        const calls: string[] = [];
        const rowData: PriceRow[] = [
            { id: 'r0', price: 0, symbol: 'AAA', group: 'A' },
            { id: 'r1', price: 0, symbol: 'BBB', group: 'A' },
        ];
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                {
                    field: 'price',
                    width: 100,
                    colSpan: (params) => {
                        calls.push(params.node!.id!);
                        return params.data ? params.data.price + 1 : 1;
                    },
                },
                priceColumnDefs[1],
                priceColumnDefs[2],
            ],
            rowData,
            getRowId: (params) => params.data.id,
            suppressAnimationFrame: true,
        });
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:100px symbol:100px group:100px'));
        api.setFocusedCell(0, 'symbol');
        api.getRowNode('r0')!.setDataValue('price', 1);
        expect(renderedRow(api, 0)).toBe('price:200px symbol:100px group:100px');

        calls.length = 0;
        api.setGridOption('rowData', [rowData[1], rowData[0]]);
        expect(renderedRow(api, 1)).toBe('price:200px group:100px');
        expect(calls.filter((id) => id === 'r0')).toEqual(['r0']);
    });

    test('a span growing over the edited cell, alone, in a full-row edit or pinned in print layout, keeps it until editing stops, after focus has moved on', async () => {
        const editAndGrowSpan = async (editType: 'fullRow' | undefined, pinned: 'left' | null = null) => {
            const api = gridsManager.createGrid(pinned ? 'printPinned' : (editType ?? 'cellEdit'), {
                columnDefs: [
                    { ...priceColumnDefs[0], pinned },
                    { ...priceColumnDefs[1], pinned, editable: true },
                    priceColumnDefs[2],
                ],
                rowData: [
                    { id: 'r0', price: 0, symbol: 'AAA', group: 'A' },
                    { id: 'r1', price: 0, symbol: 'BBB', group: 'A' },
                ],
                getRowId: (params) => params.data.id,
                editType,
                domLayout: pinned ? 'print' : undefined,
                // rebuilds run synchronously, so the check after the focus move sees the rebuild it causes
                suppressAnimationFrame: true,
            });
            const editor = () => getGridElement(api)!.querySelector('[row-index="0"] [col-id="symbol"] input');
            await waitFor(() => expect(renderedRow(api, 0)).toBe('price:100px symbol:100px group:100px'));

            api.startEditingCell({ rowIndex: 0, colKey: 'symbol' });
            await waitFor(() => expect(editor()).not.toBeNull());
            api.applyTransaction({ update: [{ id: 'r0', price: 1, symbol: 'AAA', group: 'A' }] });
            await waitFor(() => expect(renderedRow(api, 0)).toBe('price:200px symbol:100px group:100px'));
            const keptWhileEditing = editor() !== null;

            api.setFocusedCell(1, 'price');
            const keptAfterFocusMoved = editor() !== null;
            api.stopEditing();
            await waitFor(() => expect(renderedRow(api, 0)).toBe('price:200px group:100px'));
            return { keptWhileEditing, keptAfterFocusMoved };
        };

        expect({
            cell: await editAndGrowSpan(undefined),
            fullRow: await editAndGrowSpan('fullRow'),
            printPinned: await editAndGrowSpan(undefined, 'left'),
        }).toEqual({
            cell: { keptWhileEditing: true, keptAfterFocusMoved: true },
            fullRow: { keptWhileEditing: true, keptAfterFocusMoved: true },
            printPinned: { keptWhileEditing: true, keptAfterFocusMoved: true },
        });
    });

    test('cells a span grows over in a full-row edit each stop short of the next cell, kept or not', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                priceColumnDefs[0],
                {
                    ...priceColumnDefs[1],
                    editable: true,
                    colSpan: (params) => (params.data && params.data.price > 0 ? 2 : 1),
                },
                { ...priceColumnDefs[2], editable: true },
                { colId: 'tail', width: 100 },
            ],
            rowData: [
                { id: 'r0', price: 0, symbol: 'AAA', group: 'A' },
                { id: 'r1', price: 0, symbol: 'BBB', group: 'A' },
            ],
            getRowId: (params) => params.data.id,
            editType: 'fullRow',
            suppressAnimationFrame: true,
        });
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:100px symbol:100px group:100px tail:100px'));

        api.startEditingCell({ rowIndex: 0, colKey: 'symbol' });
        await waitFor(() => expect(api.getCellEditorInstances()).toHaveLength(2));
        api.applyTransaction({ update: [{ id: 'r0', price: 2, symbol: 'AAA', group: 'A' }] });
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:300px symbol:100px group:100px tail:100px'));

        api.setFocusedCell(1, 'price');
        api.stopEditing();
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:300px tail:100px'));
    });

    test('a span growing over a cell with a pending batch edit keeps it until its value is set back or the batch commits', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [priceColumnDefs[0], { ...priceColumnDefs[1], editable: true }, priceColumnDefs[2]],
            rowData: [
                { id: 'r0', price: 0, symbol: 'AAA', group: 'A' },
                { id: 'r1', price: 0, symbol: 'BBB', group: 'A' },
            ],
            getRowId: (params) => params.data.id,
        });
        const unspanned = 'price:100px symbol:100px group:100px';
        const kept = 'price:200px symbol:100px group:100px';
        const spanned = 'price:200px group:100px';
        await waitFor(() => expect(renderedRow(api, 0)).toBe(unspanned));

        api.startBatchEdit();
        api.getRowNode('r0')!.setDataValue('symbol', 'ZZZ');
        api.setFocusedCell(1, 'price');
        api.applyTransaction({ update: [{ id: 'r0', price: 1, symbol: 'AAA', group: 'A' }] });
        await waitFor(() => expect(renderedRow(api, 0)).toBe(kept));
        api.getRowNode('r0')!.setDataValue('symbol', 'AAA');
        await waitFor(() => expect(renderedRow(api, 0)).toBe(spanned));

        api.applyTransaction({ update: [{ id: 'r0', price: 0, symbol: 'AAA', group: 'A' }] });
        await waitFor(() => expect(renderedRow(api, 0)).toBe(unspanned));
        api.startEditingCell({ rowIndex: 0, colKey: 'symbol' });
        await waitFor(() => expect(api.getCellEditorInstances()).toHaveLength(1));
        api.stopEditing();
        api.setFocusedCell(1, 'price');
        api.applyTransaction({ update: [{ id: 'r0', price: 1, symbol: 'AAA', group: 'A' }] });
        await waitFor(() => expect(renderedRow(api, 0)).toBe(kept));
        api.commitBatchEdit();
        await waitFor(() => expect(renderedRow(api, 0)).toBe(spanned));
    });

    test('staged batch edits ask no colSpan callback for a row holding a kept cell', async () => {
        const calls: string[] = [];
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                {
                    field: 'price',
                    width: 100,
                    colSpan: (params) => {
                        calls.push(params.node!.id!);
                        return params.data ? params.data.price + 1 : 1;
                    },
                },
                { ...priceColumnDefs[1], editable: true },
                { ...priceColumnDefs[2], editable: true },
            ],
            rowData: [
                { id: 'r0', price: 0, symbol: 'AAA', group: 'A' },
                { id: 'r1', price: 0, symbol: 'BBB', group: 'A' },
            ],
            getRowId: (params) => params.data.id,
            suppressAnimationFrame: true,
        });
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:100px symbol:100px group:100px'));
        api.startBatchEdit();
        const row0 = api.getRowNode('r0')!;
        row0.setDataValue('symbol', 'ZZZ');
        api.setFocusedCell(1, 'price');
        api.applyTransaction({ update: [{ id: 'r0', price: 1, symbol: 'AAA', group: 'A' }] });
        expect(renderedRow(api, 0)).toBe('price:200px symbol:100px group:100px');
        await asyncSetTimeout(0);

        calls.length = 0;
        for (let i = 0; i < 5; ++i) {
            row0.setDataValue('group', `G${i}`);
        }
        await asyncSetTimeout(0);
        // a staged edit leaves the data as it was, so the row's colSpans stand
        expect(calls).toEqual([]);
    });

    test('a bulk edit growing a span over the other edited cells drops them once it ends', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                {
                    field: 'symbol',
                    width: 100,
                    editable: true,
                    colSpan: (params) => (params.data?.symbol === 'X' ? 2 : 1),
                },
                { field: 'group', width: 100, editable: true },
                { field: 'price', width: 100 },
            ],
            rowData: [
                { id: 'r0', price: 0, symbol: 'AAA', group: 'A' },
                { id: 'r1', price: 0, symbol: 'BBB', group: 'A' },
            ],
            getRowId: (params) => params.data.id,
            cellSelection: true,
            suppressAnimationFrame: true,
        });
        await waitFor(() => expect(renderedRow(api, 1)).toBe('symbol:100px group:100px price:100px'));
        const gridEl = getGridElement(api)!;
        const user = userEvent.setup({ skipHover: true });

        await user.click(gridEl.querySelector('[row-index="0"] [col-id="symbol"]')!);
        api.startEditingCell({ rowIndex: 0, colKey: 'symbol' });
        const input = await waitFor(() => gridEl.querySelector<HTMLInputElement>('[row-index="0"] input')!);
        await user.clear(input);
        await user.type(input, 'X');
        // typing collapses the selection to the edited cell, so the range goes on last
        api.clearCellSelection();
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 1, columns: ['symbol', 'group'] });
        await user.keyboard('{Control>}{Enter}{/Control}');

        await waitFor(() => expect(renderedRow(api, 1)).toBe('symbol:200px price:100px'));
        expect(renderedRow(api, 0)).toBe('symbol:200px price:100px');
    });

    test('RTL print layout keeps the lane order and follows the data in the right-pinned lane', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { ...priceColumnDefs[0], pinned: 'right' },
                { ...priceColumnDefs[1], pinned: 'right' },
                priceColumnDefs[2],
            ],
            rowData: [{ id: 'r0', price: 0, symbol: 'AAA', group: 'A' }],
            getRowId: (params) => params.data.id,
            domLayout: 'print',
            enableRtl: true,
        });
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:100px symbol:100px group:100px'));

        api.getRowNode('r0')!.setDataValue('price', 2);
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:200px group:100px'));
    });

    test('setDataValue moves a span with change detection suppressed', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: priceColumnDefs,
            rowData: [{ id: 'r0', price: 0, symbol: 'AAA', group: 'A' }],
            getRowId: (params) => params.data.id,
            suppressChangeDetection: true,
        });
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:100px symbol:100px group:100px'));

        api.getRowNode('r0')!.setDataValue('price', 1);
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:200px group:100px'));
    });

    test('a span in the pinned lane follows the data on normal and pinned-top rows, and stops at the lane edge', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { ...priceColumnDefs[0], pinned: 'left' },
                { field: 'symbol', width: 100, pinned: 'left' },
                { field: 'group', width: 100 },
            ],
            rowData: [{ id: 'r0', price: 0, symbol: 'AAA', group: 'A' }],
            pinnedTopRowData: [{ id: 'p0', price: 0, symbol: 'PPP', group: 'P' }],
            getRowId: (params) => params.data.id,
        });
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:100px symbol:100px group:100px'));
        expect(renderedRow(api, 't-0')).toBe('price:100px symbol:100px group:100px');

        api.getRowNode('r0')!.setDataValue('price', 2);
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:200px group:100px'));

        const pinnedRow = api.getPinnedTopRow(0)!;
        pinnedRow.setDataValue('price', 1);
        await waitFor(() => expect(renderedRow(api, 't-0')).toBe('price:200px group:100px'));

        pinnedRow.data!.price = 0;
        api.refreshCells({ rowNodes: [pinnedRow] });
        await waitFor(() => expect(renderedRow(api, 't-0')).toBe('price:100px symbol:100px group:100px'));
    });

    test('infinite rows refreshed from the datasource span by the new data', async () => {
        let price = 0;
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: priceColumnDefs,
            rowModelType: 'infinite',
            getRowId: (params) => params.data.id,
            datasource: {
                getRows: (params) => params.successCallback([{ id: 'r0', price, symbol: 'AAA', group: 'A' }], 1),
            },
        });

        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:100px symbol:100px group:100px'));

        price = 2;
        api.refreshInfiniteCache();

        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:300px'));
    });

    test('a span kept out of the viewport for focus, then entering it from a column scrolled out, follows the data', async () => {
        const columnDefs: ColDef<PriceRow>[] = [
            { field: 'price', width: 120, colSpan: (params) => (params.data ? params.data.price + 1 : 1) },
        ];
        for (let i = 1; i < 120; ++i) {
            columnDefs.push({ colId: `c${i}`, valueGetter: () => i, width: 120 });
        }
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: [{ id: 'r0', price: 0, symbol: 'AAA', group: 'A' }],
            getRowId: (params) => params.data.id,
            suppressColumnVirtualisation: false,
        });
        const priceCell = () => getGridElement(api)!.querySelector<HTMLElement>('[row-index="0"] [col-id="price"]');
        await waitFor(() => expect(priceCell()).not.toBeNull());

        api.setFocusedCell(0, 'price');
        api.ensureColumnVisible('c60');
        await waitFor(() =>
            expect(getGridElement(api)!.querySelector('[row-index="0"] [col-id="c60"]')).not.toBeNull()
        );
        expect(priceCell()?.style.width).toBe('120px');
        api.getRowNode('r0')!.setDataValue('price', 1);
        await waitFor(() => expect(priceCell()?.style.width).toBe('240px'));

        api.setFocusedCell(0, 'c60');
        await waitFor(() => expect(priceCell()).toBeNull());
        api.getRowNode('r0')!.setDataValue('price', 70);
        await waitFor(() => expect(priceCell()?.style.width).toBe(`${71 * 120}px`));
    });

    test('cells a scroll to the left adds go in before the cells already drawn, in column order', async () => {
        const columnDefs: ColDef[] = [];
        for (let i = 0; i < 40; ++i) {
            columnDefs.push({ colId: `c${i}`, valueGetter: () => i, width: 120 });
        }
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: [{ id: 'r0' }],
            suppressColumnVirtualisation: false,
            ensureDomOrder: false,
        });
        const drawn = () =>
            Array.from(getGridElement(api)!.querySelectorAll('.ag-row[row-index="0"] .ag-cell'), (cell) =>
                Number(cell.getAttribute('col-id')!.slice(1))
            );
        api.ensureColumnVisible('c38');
        await waitFor(() => expect(drawn()).toContain(38));
        const keptFirst = Math.min(...drawn());

        api.ensureColumnVisible('c24');
        await waitFor(() => expect(drawn()).toContain(24));

        const cols = drawn();
        expect(cols).toContain(keptFirst);
        expect(cols[0]).toBeLessThan(keptFirst);
        expect(cols).toEqual([...cols].sort((a, b) => a - b));
    });

    test('a colSpan column right of the viewport is not asked for its span until it scrolls in', async () => {
        let farRightCalls = 0;
        const columnDefs: ColDef<PriceRow>[] = [{ field: 'price', width: 120 }];
        for (let i = 1; i < 120; ++i) {
            columnDefs.push({ colId: `c${i}`, valueGetter: () => i, width: 120 });
        }
        columnDefs[100].colSpan = () => {
            ++farRightCalls;
            return 2;
        };
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: [{ id: 'r0', price: 0, symbol: 'AAA', group: 'A' }],
            getRowId: (params) => params.data.id,
            suppressColumnVirtualisation: false,
            // the data change lays the row out synchronously, so the count below sees that walk
            suppressAnimationFrame: true,
        });
        const cell = (colId: string) =>
            getGridElement(api)!.querySelector<HTMLElement>(`[row-index="0"] [col-id="${colId}"]`);
        await waitFor(() => expect(cell('price')).not.toBeNull());

        api.getRowNode('r0')!.setDataValue('price', 1);
        await waitFor(() => expect(cell('price')?.textContent).toBe('1'));
        expect(farRightCalls).toBe(0);

        api.ensureColumnVisible('c100');
        await waitFor(() => expect(cell('c100')?.style.width).toBe('240px'));
        expect(farRightCalls).toBeGreaterThan(0);
    });

    test('a horizontal scroll lays the rows out again without asking a colSpan callback again', async () => {
        const calls: string[] = [];
        const columnDefs: ColDef<PriceRow>[] = [
            {
                field: 'price',
                width: 120,
                colSpan: (params) => {
                    calls.push(params.node!.id!);
                    return params.data ? params.data.price + 1 : 1;
                },
            },
        ];
        for (let i = 1; i < 120; ++i) {
            columnDefs.push({ colId: `c${i}`, valueGetter: () => i, width: 120 });
        }
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: [
                { id: 'r0', price: 0, symbol: 'AAA', group: 'A' },
                { id: 'r1', price: 0, symbol: 'BBB', group: 'A' },
            ],
            getRowId: (params) => params.data.id,
            suppressColumnVirtualisation: false,
        });
        const cell = (colId: string) =>
            getGridElement(api)!.querySelector<HTMLElement>(`[row-index="0"] [col-id="${colId}"]`);
        await waitFor(() => expect(cell('price')).not.toBeNull());

        calls.length = 0;
        api.ensureColumnVisible('c60');
        await waitFor(() => expect(cell('c60')).not.toBeNull());
        api.ensureColumnVisible('price');
        await waitFor(() => expect(cell('price')).not.toBeNull());
        expect(calls).toEqual([]);

        // a data change reads the edited row's span again, which the next scroll reuses
        api.getRowNode('r0')!.setDataValue('price', 1);
        await waitFor(() => expect(cell('price')?.style.width).toBe('240px'));
        expect(calls).toEqual(['r0']);
        calls.length = 0;
        api.ensureColumnVisible('c60');
        await waitFor(() => expect(cell('c60')).not.toBeNull());
        expect(calls).toEqual([]);
    });

    test('moving a column reads the colSpans again in the new order', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ ...priceColumnDefs[0], colSpan: () => 2 }, priceColumnDefs[1], priceColumnDefs[2]],
            rowData: [{ id: 'r0', price: 1, symbol: 'AAA', group: 'A' }],
            getRowId: (params) => params.data.id,
        });
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:200px group:100px'));

        api.moveColumns(['price'], 2);
        await waitFor(() => expect(renderedRow(api, 0)).toBe('symbol:100px group:100px price:100px'));
        api.moveColumns(['price'], 1);
        await waitFor(() => expect(renderedRow(api, 0)).toBe('symbol:100px price:200px'));
    });

    test('a colSpan callback replaced through autoGroupColumnDef spans the group rows already rendered', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'gold', width: 100 },
                { field: 'silver', width: 100 },
            ],
            autoGroupColumnDef: { width: 100, colSpan: () => 1 },
            groupDefaultExpanded: -1,
            rowData: [{ id: 'l0', country: 'X', gold: 3, silver: 1 }],
            getRowId: (params) => params.data.id,
        });
        await waitFor(() => expect(renderedRow(api, 0)).toBe('ag-Grid-AutoColumn:100px gold:100px silver:100px'));

        api.setGridOption('autoGroupColumnDef', { width: 100, colSpan: (params) => (params.node?.group ? 2 : 1) });
        await waitFor(() => expect(renderedRow(api, 0)).toBe('ag-Grid-AutoColumn:200px silver:100px'));
        expect(renderedRow(api, 1)).toBe('ag-Grid-AutoColumn:100px gold:100px silver:100px');
    });

    test('a focused cell a span grows over asks its colSpan callback once, not again as the grid scrolls', async () => {
        const calls: string[] = [];
        const columnDefs: ColDef<PriceRow>[] = [
            { field: 'price', width: 120, colSpan: (params) => (params.data ? params.data.price + 1 : 1) },
            {
                field: 'symbol',
                width: 120,
                colSpan: (params) => {
                    calls.push(params.node!.id!);
                    return 1;
                },
            },
        ];
        for (let i = 2; i < 120; ++i) {
            columnDefs.push({ colId: `c${i}`, valueGetter: () => i, width: 120 });
        }
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: [{ id: 'r0', price: 0, symbol: 'AAA', group: 'A' }],
            getRowId: (params) => params.data.id,
            suppressColumnVirtualisation: false,
        });
        const cell = (colId: string) =>
            getGridElement(api)!.querySelector<HTMLElement>(`[row-index="0"] [col-id="${colId}"]`);
        await waitFor(() => expect(cell('symbol')).not.toBeNull());

        api.setFocusedCell(0, 'symbol');
        calls.length = 0;
        api.getRowNode('r0')!.setDataValue('price', 1);
        await waitFor(() => expect(cell('price')?.style.width).toBe('240px'));
        expect(cell('symbol')).not.toBeNull();
        expect(calls).toEqual(['r0']);

        api.ensureColumnVisible('c60');
        await waitFor(() => expect(cell('c60')).not.toBeNull());
        expect(cell('symbol')).not.toBeNull();
        expect(calls).toEqual(['r0']);
    });

    test('RTL spans in the right-pinned and centre lanes each keep their own colSpan', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { ...priceColumnDefs[0], pinned: 'right' },
                { ...priceColumnDefs[1], pinned: 'right' },
                { ...priceColumnDefs[2], colSpan: () => 2 },
                { colId: 'extra', valueGetter: () => 0, width: 100 },
            ],
            rowData: [{ id: 'r0', price: 0, symbol: 'AAA', group: 'A' }],
            getRowId: (params) => params.data.id,
            enableRtl: true,
        });
        await waitFor(() => expect(renderedRow(api, 0)).toBe('group:200px price:100px symbol:100px'));

        api.getRowNode('r0')!.setDataValue('price', 1);
        await waitFor(() => expect(renderedRow(api, 0)).toBe('group:200px price:200px'));
    });

    test('pinning and unpinning a column reads the colSpans again for the new lanes', async () => {
        const api = gridsManager.createGrid(
            'myGrid',
            {
                columnDefs: [
                    { ...priceColumnDefs[0], colSpan: (params) => (params.column.isPinned() ? 2 : 1) },
                    priceColumnDefs[1],
                    priceColumnDefs[2],
                ],
                rowData: [{ id: 'r0', price: 1, symbol: 'AAA', group: 'A' }],
                getRowId: (params) => params.data.id,
            },
            { modules: [ColumnApiModule] }
        );
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:100px symbol:100px group:100px'));

        api.setColumnsPinned(['price', 'symbol'], 'left');
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:200px group:100px'));
        api.setColumnsPinned(['price', 'symbol'], null);
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:100px symbol:100px group:100px'));
    });

    describe('with an auto-height column', () => {
        const SYMBOL_HEIGHT = 120;
        const ROW_HEIGHT = 30;
        let uninstallResizeObserver: () => void;

        beforeAll(() => {
            mockGridLayout.useRealOffsetDimensions = true;
            mockGridLayout.elementHeightOverride = (el) =>
                el.classList.contains('ag-cell-wrapper') && el.closest('.ag-cell')?.getAttribute('col-id') === 'symbol'
                    ? SYMBOL_HEIGHT
                    : undefined;
        });

        afterAll(() => {
            mockGridLayout.useRealOffsetDimensions = false;
            mockGridLayout.elementHeightOverride = undefined;
        });

        beforeEach(() => {
            uninstallResizeObserver = installMockResizeObserver();
        });

        afterEach(() => {
            uninstallResizeObserver();
        });

        test('a re-measure asks getRowHeight only for the rows whose auto-height cells are all measured', async () => {
            let getRowHeightCalls = 0;
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'price', width: 100, colSpan: (params) => (params.data ? params.data.price + 1 : 1) },
                    { field: 'symbol', width: 100, autoHeight: true, wrapText: true },
                    { field: 'group', width: 100 },
                ],
                rowData: Array.from({ length: 200 }, (_, i) => ({ id: `r${i}`, price: 0, symbol: 'AAA', group: 'A' })),
                getRowId: (params) => params.data.id,
                getRowHeight: () => {
                    ++getRowHeightCalls;
                    return ROW_HEIGHT;
                },
                rowBuffer: 0,
                suppressRowVirtualisation: false,
            });
            const row0 = api.getRowNode('r0')!;
            await waitFor(() => expect(row0.rowHeight).toBe(SYMBOL_HEIGHT));
            await asyncSetTimeout(0);

            getRowHeightCalls = 0;
            row0.setDataValue('price', 1);
            await waitFor(() => expect(row0.rowHeight).toBe(ROW_HEIGHT));
            expect(getRowHeightCalls).toBeLessThan(100);
        });

        test('a row a span grows over while not rendered keeps its height until it renders, then sheds the covered cell', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'price', width: 100, colSpan: (params) => (params.data ? params.data.price + 1 : 1) },
                    { field: 'symbol', width: 100, autoHeight: true, wrapText: true },
                    { field: 'group', width: 100 },
                ],
                rowData: Array.from({ length: 40 }, (_, i) => ({ id: `r${i}`, price: 0, symbol: 'AAA', group: 'A' })),
                getRowId: (params) => params.data.id,
                rowHeight: ROW_HEIGHT,
                rowBuffer: 0,
                suppressRowVirtualisation: false,
            });
            const row0 = api.getRowNode('r0')!;
            await waitFor(() => expect(row0.rowHeight).toBe(SYMBOL_HEIGHT));

            api.ensureIndexVisible(39);
            await waitFor(() => expect(getGridElement(api)!.querySelector('.ag-row[row-index="0"]')).toBeNull());
            row0.setDataValue('price', 1);
            await asyncSetTimeout(0);
            expect(row0.rowHeight).toBe(SYMBOL_HEIGHT);

            api.ensureIndexVisible(0);
            await waitFor(() => expect(renderedRow(api, 0)).toBe('price:200px group:100px'));
            await waitFor(() => expect(row0.rowHeight).toBe(ROW_HEIGHT));
        });

        test('a row sheds the height of an auto-height cell a span grows over and regains it as the span shrinks, but a focused one holds it until focus moves on', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'price', width: 100, colSpan: (params) => (params.data ? params.data.price + 1 : 1) },
                    { field: 'symbol', width: 100, autoHeight: true, wrapText: true },
                    { field: 'group', width: 100 },
                ],
                rowData: [
                    { id: 'r0', price: 0, symbol: 'AAA', group: 'A' },
                    { id: 'r1', price: 0, symbol: 'BBB', group: 'A' },
                ],
                getRowId: (params) => params.data.id,
                rowHeight: ROW_HEIGHT,
            });
            const row0 = api.getRowNode('r0')!;
            await waitFor(() => expect(row0.rowHeight).toBe(SYMBOL_HEIGHT));

            row0.setDataValue('price', 1);
            await waitFor(() => expect(renderedRow(api, 0)).toBe('price:200px group:100px'));
            await waitFor(() => expect(row0.rowHeight).toBe(ROW_HEIGHT));
            row0.setDataValue('price', 0);
            await waitFor(() => expect(row0.rowHeight).toBe(SYMBOL_HEIGHT));

            api.setFocusedCell(0, 'symbol');
            row0.setDataValue('price', 1);
            await waitFor(() => expect(renderedRow(api, 0)).toBe('price:200px symbol:100px group:100px'));
            // any re-measure the span change asked for runs first, so only the focus move can shrink the row
            await asyncSetTimeout(0);
            expect(row0.rowHeight).toBe(SYMBOL_HEIGHT);

            api.setFocusedCell(1, 'price');
            await waitFor(() => expect(renderedRow(api, 0)).toBe('price:200px group:100px'));
            await waitFor(() => expect(row0.rowHeight).toBe(ROW_HEIGHT));
        });
    });
});
