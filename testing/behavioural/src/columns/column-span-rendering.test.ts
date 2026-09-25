import { waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import { installMockResizeObserver } from 'ag-test-utils/polyfills/mockResizeObserver';

import type { ColDef, GridApi } from 'ag-grid-community';
import {
    CellStyleModule,
    ClientSideRowModelModule,
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

    test('spanning cell width equals sum of spanned column widths', async () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs, rowData });
        await new GridColumns(api, `spanning cell width equals sum of spanned column widths setup`).checkColumns(`
            CENTER
            ├── a "A" width:100
            ├── b "B" width:100
            └── c "C" width:100
        `);
        await new GridRows(api, `spanning cell width equals sum of spanned column widths setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"a0" b:"b0" c:"c0"
            └── LEAF id:1 a:"a1" b:"b1" c:"c1"
        `);
        const gridEl = getGridElement(api)!;
        const spanningCell = gridEl.querySelector('[row-index="1"] [col-id="a"]') as HTMLElement | null;
        expect(spanningCell).not.toBeNull();
        // col 'a' (100px) + col 'b' (100px) = 200px
        expect(spanningCell!.style.width).toBe('200px');
        await new GridRows(api, `spanning cell width equals sum of spanned column widths final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"a0" b:"b0" c:"c0"
            └── LEAF id:1 a:"a1" b:"b1" c:"c1"
        `);
    });

    test('print layout drops the covered cell, and stops a span at the pinned lane edge', async () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs, rowData, domLayout: 'print' });
        const gridEl = getGridElement(api)!;
        const cell = (rowIndex: number, colId: string) =>
            gridEl.querySelector<HTMLElement>(`[row-index="${rowIndex}"] [col-id="${colId}"]`);
        await waitFor(() => expect(cell(1, 'a')?.style.width).toBe('200px'));
        expect(cell(1, 'b')).toBeNull();
        expect(cell(0, 'b')).not.toBeNull();

        api.setGridOption('columnDefs', [{ ...columnDefs[0], pinned: 'left' }, columnDefs[1], columnDefs[2]]);
        await waitFor(() => expect(cell(1, 'b')).not.toBeNull());
        expect(cell(1, 'a')!.style.width).toBe('100px');
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

    test('covered cell is absent from DOM on spanning row', async () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs, rowData });
        await new GridColumns(api, `covered cell is absent from DOM on spanning row setup`).checkColumns(`
            CENTER
            ├── a "A" width:100
            ├── b "B" width:100
            └── c "C" width:100
        `);
        await new GridRows(api, `covered cell is absent from DOM on spanning row setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"a0" b:"b0" c:"c0"
            └── LEAF id:1 a:"a1" b:"b1" c:"c1"
        `);
        const gridEl = getGridElement(api)!;
        const coveredCell = gridEl.querySelector('[row-index="1"] [col-id="b"]');
        expect(coveredCell).toBeNull();
        await new GridRows(api, `covered cell is absent from DOM on spanning row final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"a0" b:"b0" c:"c0"
            └── LEAF id:1 a:"a1" b:"b1" c:"c1"
        `);
    });

    test('non-spanning row renders all cells at their own width', async () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs, rowData });
        await new GridColumns(api, `non-spanning row renders all cells at their own width setup`).checkColumns(`
            CENTER
            ├── a "A" width:100
            ├── b "B" width:100
            └── c "C" width:100
        `);
        await new GridRows(api, `non-spanning row renders all cells at their own width setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"a0" b:"b0" c:"c0"
            └── LEAF id:1 a:"a1" b:"b1" c:"c1"
        `);
        const gridEl = getGridElement(api)!;
        const row0 = gridEl.querySelector('[row-index="0"]')!;
        const cellA = row0.querySelector('[col-id="a"]') as HTMLElement | null;
        const cellB = row0.querySelector('[col-id="b"]') as HTMLElement | null;
        const cellC = row0.querySelector('[col-id="c"]') as HTMLElement | null;
        expect(cellA).not.toBeNull();
        expect(cellB).not.toBeNull();
        expect(cellC).not.toBeNull();
        expect(cellA!.style.width).toBe('100px');
        expect(cellB!.style.width).toBe('100px');
        expect(cellC!.style.width).toBe('100px');
        await new GridRows(api, `non-spanning row renders all cells at their own width final state`).check(`
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

    const renderedRow = (api: GridApi, rowIndex: number | string) => {
        const cells = Array.from(
            getGridElement(api)!.querySelectorAll<HTMLElement>(`.ag-row[row-index="${rowIndex}"] .ag-cell`)
        );
        return cells.map((cell) => `${cell.getAttribute('col-id')}:${cell.style.width}`).join(' ');
    };

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

    test('a span growing over the focused cell keeps it rendered until focus moves on', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: priceColumnDefs,
            rowData: [
                { id: 'r0', price: 0, symbol: 'AAA', group: 'A' },
                { id: 'r1', price: 0, symbol: 'BBB', group: 'A' },
            ],
            getRowId: (params) => params.data.id,
        });
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:100px symbol:100px group:100px'));

        api.setFocusedCell(0, 'symbol');
        await waitFor(() => expect(document.activeElement?.getAttribute('col-id')).toBe('symbol'));
        api.getRowNode('r0')!.setDataValue('price', 1);
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:200px symbol:100px group:100px'));
        expect(api.getFocusedCell()).toMatchObject({ rowIndex: 0, column: api.getColumn('symbol') });
        expect(document.activeElement?.getAttribute('col-id')).toBe('symbol');

        api.setFocusedCell(1, 'price');
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:200px group:100px'));
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

    test('a span growing over the edited cell keeps it until editing stops, after focus has moved on', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [priceColumnDefs[0], { ...priceColumnDefs[1], editable: true }, priceColumnDefs[2]],
            rowData: [
                { id: 'r0', price: 0, symbol: 'AAA', group: 'A' },
                { id: 'r1', price: 0, symbol: 'BBB', group: 'A' },
            ],
            getRowId: (params) => params.data.id,
            // rebuilds run synchronously, so the check after the focus move sees the rebuild it causes
            suppressAnimationFrame: true,
        });
        const editor = () => getGridElement(api)!.querySelector('[row-index="0"] [col-id="symbol"] input');
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:100px symbol:100px group:100px'));

        api.startEditingCell({ rowIndex: 0, colKey: 'symbol' });
        await waitFor(() => expect(editor()).not.toBeNull());
        api.applyTransaction({ update: [{ id: 'r0', price: 1, symbol: 'AAA', group: 'A' }] });
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:200px symbol:100px group:100px'));
        expect(editor()).not.toBeNull();

        api.setFocusedCell(1, 'price');
        await waitFor(() => expect(editor()).not.toBeNull());
        api.stopEditing();
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:200px group:100px'));
    });

    test('a span growing over a cell of a full-row edit keeps it until editing stops, after focus has moved on', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [priceColumnDefs[0], { ...priceColumnDefs[1], editable: true }, priceColumnDefs[2]],
            rowData: [
                { id: 'r0', price: 0, symbol: 'AAA', group: 'A' },
                { id: 'r1', price: 0, symbol: 'BBB', group: 'A' },
            ],
            getRowId: (params) => params.data.id,
            editType: 'fullRow',
            suppressAnimationFrame: true,
        });
        const editor = () => getGridElement(api)!.querySelector('[row-index="0"] [col-id="symbol"] input');
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:100px symbol:100px group:100px'));

        api.startEditingCell({ rowIndex: 0, colKey: 'symbol' });
        await waitFor(() => expect(editor()).not.toBeNull());
        api.applyTransaction({ update: [{ id: 'r0', price: 1, symbol: 'AAA', group: 'A' }] });
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:200px symbol:100px group:100px'));

        api.setFocusedCell(1, 'price');
        expect(editor()).not.toBeNull();
        api.stopEditing();
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:200px group:100px'));
    });

    test('a span growing over a cell with a pending batch edit keeps it until the batch commits', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [priceColumnDefs[0], { ...priceColumnDefs[1], editable: true }, priceColumnDefs[2]],
            rowData: [
                { id: 'r0', price: 0, symbol: 'AAA', group: 'A' },
                { id: 'r1', price: 0, symbol: 'BBB', group: 'A' },
            ],
            getRowId: (params) => params.data.id,
        });
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:100px symbol:100px group:100px'));

        api.startBatchEdit();
        api.startEditingCell({ rowIndex: 0, colKey: 'symbol' });
        await waitFor(() => expect(api.getCellEditorInstances()).toHaveLength(1));
        api.stopEditing();
        api.setFocusedCell(1, 'price');
        api.applyTransaction({ update: [{ id: 'r0', price: 1, symbol: 'AAA', group: 'A' }] });
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:200px symbol:100px group:100px'));

        api.commitBatchEdit();
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:200px group:100px'));
    });

    test('a covered cell kept for a pending batch edit is dropped once its value is set back to the original', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [priceColumnDefs[0], { ...priceColumnDefs[1], editable: true }, priceColumnDefs[2]],
            rowData: [
                { id: 'r0', price: 0, symbol: 'AAA', group: 'A' },
                { id: 'r1', price: 0, symbol: 'BBB', group: 'A' },
            ],
            getRowId: (params) => params.data.id,
        });
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:100px symbol:100px group:100px'));

        api.startBatchEdit();
        api.getRowNode('r0')!.setDataValue('symbol', 'ZZZ');
        api.setFocusedCell(1, 'price');
        api.applyTransaction({ update: [{ id: 'r0', price: 1, symbol: 'AAA', group: 'A' }] });
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:200px symbol:100px group:100px'));

        api.getRowNode('r0')!.setDataValue('symbol', 'AAA');
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:200px group:100px'));
    });

    test('staged batch edits lay a row holding a kept cell out once, not once per edit', async () => {
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
        expect(calls.filter((id) => id === 'r0')).toEqual(['r0']);
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

    test('print layout keeps an edited pinned cell a span grows over until editing stops, after focus has moved on', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { ...priceColumnDefs[0], pinned: 'left' },
                { ...priceColumnDefs[1], pinned: 'left', editable: true },
                priceColumnDefs[2],
            ],
            rowData: [
                { id: 'r0', price: 0, symbol: 'AAA', group: 'A' },
                { id: 'r1', price: 0, symbol: 'BBB', group: 'A' },
            ],
            getRowId: (params) => params.data.id,
            domLayout: 'print',
        });
        const editor = () => getGridElement(api)!.querySelector('[row-index="0"] [col-id="symbol"] input');
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:100px symbol:100px group:100px'));

        api.startEditingCell({ rowIndex: 0, colKey: 'symbol' });
        await waitFor(() => expect(editor()).not.toBeNull());
        api.applyTransaction({ update: [{ id: 'r0', price: 1, symbol: 'AAA', group: 'A' }] });
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:200px symbol:100px group:100px'));
        expect(editor()).not.toBeNull();

        api.setFocusedCell(1, 'price');
        await waitFor(() => expect(editor()).not.toBeNull());
        api.stopEditing();
        await waitFor(() => expect(renderedRow(api, 0)).toBe('price:200px group:100px'));
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

        api.getPinnedTopRow(0)!.setDataValue('price', 1);
        await waitFor(() => expect(renderedRow(api, 't-0')).toBe('price:200px group:100px'));
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

    test('a span entering the viewport from a column scrolled out of it follows the data', async () => {
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

        api.ensureColumnVisible('c60');
        await waitFor(() => expect(priceCell()).toBeNull());

        api.getRowNode('r0')!.setDataValue('price', 70);
        await waitFor(() => expect(priceCell()?.style.width).toBe(`${71 * 120}px`));
    });

    test('a focused spanning cell kept out of the viewport follows the data', async () => {
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

        test('a row sheds the height of an auto-height cell a span grows over, and regains it when the span shrinks', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'price', width: 100, colSpan: (params) => (params.data ? params.data.price + 1 : 1) },
                    { field: 'symbol', width: 100, autoHeight: true, wrapText: true },
                    { field: 'group', width: 100 },
                ],
                rowData: [{ id: 'r0', price: 0, symbol: 'AAA', group: 'A' }],
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
        });

        test('a focused auto-height cell a span grows over holds the row open until focus moves on', async () => {
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
