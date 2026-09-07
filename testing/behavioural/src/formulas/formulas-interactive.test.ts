import { getByTestId, waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import {
    GridColumns,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    clipboardUtils,
    initPointerEventPolyfill,
    waitForEvent,
} from 'ag-test-utils';

import type { GridApi, GridOptions, Module } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    NumberFilterModule,
    TextEditorModule,
    UndoRedoEditModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import { BatchEditModule, CellSelectionModule, ClipboardModule, FormulaModule } from 'ag-grid-enterprise';

describe('ag-grid formulas interactive workflows', () => {
    const gridRowsOpts = { useFormatter: false } as const;

    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            FormulaModule,
            NumberFilterModule,
            TextEditorModule,
            UndoRedoEditModule,
            CellSelectionModule,
            ClipboardModule,
            BatchEditModule,
        ] as Module[],
    });

    beforeAll(() => {
        initPointerEventPolyfill();
        setupAgTestIds();
        clipboardUtils.init();
    });

    beforeEach(() => {
        clipboardUtils.init();
    });

    afterEach(() => {
        gridsManager.reset();
        clipboardUtils.reset();
    });

    function createGrid(id: string, opts: Partial<GridOptions>) {
        const options: GridOptions = {
            defaultColDef: { allowFormula: true, editable: true },
            getRowId: (params) => params.data?.id,
            ...opts,
        };
        return gridsManager.createGridAndWait(id, options);
    }

    test('pasting a raw formula string evaluates in the destination row', async () => {
        const api = await createGrid('fx-clipboard-paste', {
            cellSelection: true,
            rowData: [
                { id: 'r1', a: 2, b: 3, out: null },
                { id: 'r2', a: 5, b: 7, out: null },
            ],
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'out' }],
        });

        await new GridRows(api, 'before paste', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" a:2 b:3 out:null
            └── LEAF id:r2 row-number:"2" a:5 b:7 out:null
        `);

        clipboardUtils.setText('=REF(COLUMN("a"),ROW("r2"))+REF(COLUMN("b"),ROW("r2"))');
        api.setFocusedCell(1, 'out');
        const pasteEnd = waitForEvent('pasteEnd', api);
        api.pasteFromClipboard();
        await pasteEnd;

        const r2 = api.getRowNode('r2')!;
        await waitFor(() => expect(api.getCellValue({ rowNode: r2, colKey: 'out', useFormatter: false })).toBe(12));

        const r1 = api.getRowNode('r1')!;
        expect(api.getCellValue({ rowNode: r1, colKey: 'out', useFormatter: false })).toBeNull();
    });

    test('fill handle drag down replicates a formula with row-shifted refs', async () => {
        const api = await createGrid('fx-fill-handle', {
            cellSelection: { handle: { mode: 'fill' } },
            rowData: [
                { id: 'r1', a: 1, b: 10, total: '=REF(COLUMN("a"),ROW("r1"))+REF(COLUMN("b"),ROW("r1"))' },
                { id: 'r2', a: 2, b: 20, total: null },
                { id: 'r3', a: 3, b: 30, total: null },
                { id: 'r4', a: 4, b: 40, total: null },
            ],
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'total' }],
        });

        const gridDiv = getGridElement(api)! as HTMLElement;

        await new GridRows(api, 'before fill', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" a:1 b:10 total:11
            ├── LEAF id:r2 row-number:"2" a:2 b:20 total:null
            ├── LEAF id:r3 row-number:"3" a:3 b:30 total:null
            └── LEAF id:r4 row-number:"4" a:4 b:40 total:null
        `);

        api.setFocusedCell(0, 'total');
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 0, columns: ['total'] });

        const fillHandle = await waitFor(() => {
            const element = getByTestId(gridDiv, agTestIdFor.fillHandle());
            expect(element).toBeTruthy();
            return element;
        });
        const fillEnd = waitForEvent('fillEnd', api);
        await userEvent.dblClick(fillHandle);
        await fillEnd;

        await new GridRows(api, 'after fill down', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" a:1 b:10 total:11
            ├── LEAF id:r2 row-number:"2" a:2 b:20 total:22
            ├── LEAF id:r3 row-number:"3" a:3 b:30 total:33
            └── LEAF id:r4 row-number:"4" a:4 b:40 total:44
        `);
    });

    // AG-18276: the fill walks displayed rows while formula refs shift in formula-row space, so a
    // filter makes the two diverge unless the offset is measured between the target rows.
    test('fill handle drag down offsets formula refs by the target row when a filter is active', async () => {
        const api = await createGrid('fx-fill-handle-filtered', {
            cellSelection: { handle: { mode: 'fill' } },
            rowData: [
                {
                    id: 'r1',
                    a: 1,
                    b: 10,
                    // The third term is an absolute ref, which must stay pinned to row 1 (adding 100)
                    // in every filled cell however the relative terms move.
                    total: '=REF(COLUMN("a"),ROW("r1"))+REF(COLUMN("b"),ROW("r1"))+REF(COLUMN("b",true),ROW("1",true))*10',
                },
                { id: 'r2', a: 2, b: 20, total: null },
                { id: 'r3', a: 3, b: 30, total: null },
                { id: 'r4', a: 4, b: 40, total: null },
                { id: 'r5', a: 5, b: 50, total: null },
                { id: 'r6', a: 6, b: 60, total: null },
            ],
            columnDefs: [{ field: 'a', filter: 'agNumberColumnFilter' }, { field: 'b' }, { field: 'total' }],
        });

        // Hide r2 and r4 so the visible rows are non-consecutive in formulaRows space.
        const filterChanged = waitForEvent('filterChanged', api);
        api.setFilterModel({
            a: {
                filterType: 'number',
                operator: 'OR',
                conditions: [
                    { filterType: 'number', type: 'equals', filter: 1 },
                    { filterType: 'number', type: 'equals', filter: 3 },
                    { filterType: 'number', type: 'equals', filter: 5 },
                    { filterType: 'number', type: 'equals', filter: 6 },
                ],
            },
        });
        await filterChanged;

        // row-number reflects formulaRowIndex + 1, so the gaps at 2 and 4 are visible here.
        await new GridRows(api, 'before fill (filtered)', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" a:1 b:10 total:111
            ├── LEAF id:r3 row-number:"3" a:3 b:30 total:null
            ├── LEAF id:r5 row-number:"5" a:5 b:50 total:null
            └── LEAF id:r6 row-number:"6" a:6 b:60 total:null
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;

        api.setFocusedCell(0, 'total');
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 0, columns: ['total'] });

        const fillHandle = await waitFor(() => {
            const element = getByTestId(gridDiv, agTestIdFor.fillHandle());
            expect(element).toBeTruthy();
            return element;
        });
        const fillEnd = waitForEvent('fillEnd', api);
        await userEvent.dblClick(fillHandle);
        await fillEnd;

        // Each filled cell references its own row, plus the unshifted absolute term.
        await new GridRows(api, 'after fill down (filtered)', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" a:1 b:10 total:111
            ├── LEAF id:r3 row-number:"3" a:3 b:30 total:133
            ├── LEAF id:r5 row-number:"5" a:5 b:50 total:155
            └── LEAF id:r6 row-number:"6" a:6 b:60 total:166
        `);

        // The hidden rows must not be written to by the fill.
        for (const id of ['r2', 'r4']) {
            const node = api.getRowNode(id)!;
            expect(api.getCellValue({ rowNode: node, colKey: 'total', useFormatter: false })).toBeNull();
        }
    });

    test('batch-edit commit persists formula edits and their computed values', async () => {
        const api = await createGrid('fx-batch-commit', {
            cellSelection: true,
            rowData: [
                { id: 'r1', a: 2, b: 3, out: '=REF(COLUMN("a"),ROW("r1"))+REF(COLUMN("b"),ROW("r1"))' },
                { id: 'r2', a: 5, b: 7, out: '=REF(COLUMN("a"),ROW("r2"))+REF(COLUMN("b"),ROW("r2"))' },
            ],
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'out' }],
        });

        await new GridRows(api, 'initial', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" a:2 b:3 out:5
            └── LEAF id:r2 row-number:"2" a:5 b:7 out:12
        `);

        api.startBatchEdit();
        expect(api.isBatchEditing()).toBe(true);

        api.getRowNode('r1')!.setDataValue('out', '=REF(COLUMN("a"),ROW("r1"))*REF(COLUMN("b"),ROW("r1"))');
        api.getRowNode('r2')!.setDataValue('a', 10);

        api.commitBatchEdit();
        expect(api.isBatchEditing()).toBe(false);

        await new GridRows(api, 'after commit', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" a:2 b:3 out:6
            └── LEAF id:r2 row-number:"2" a:10 b:7 out:17
        `);
    });

    test('batch-edit cancel rolls back pending formula edits', async () => {
        const api = await createGrid('fx-batch-cancel', {
            cellSelection: true,
            rowData: [{ id: 'r1', a: 2, b: 3, out: '=REF(COLUMN("a"),ROW("r1"))+REF(COLUMN("b"),ROW("r1"))' }],
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'out' }],
        });

        await new GridRows(api, 'initial', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" a:2 b:3 out:5
        `);

        api.startBatchEdit();
        api.getRowNode('r1')!.setDataValue('out', '=REF(COLUMN("a"),ROW("r1"))*REF(COLUMN("b"),ROW("r1"))*100');
        api.getRowNode('r1')!.setDataValue('a', 99);

        api.cancelBatchEdit();

        await new GridRows(api, 'after cancel', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" a:2 b:3 out:5
        `);
    });

    test('tabbing forward from an editing formula cell commits it and moves focus right', async () => {
        const api = await createGrid('fx-tab-forward', {
            cellSelection: true,
            rowData: [{ id: 'r1', a: 5, b: 0, c: 0 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
        });
        await new GridColumns(
            api,
            `tabbing forward from an editing formula cell commits it and moves focus right setup`
        ).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── a "A" width:200 editable
            ├── b "B" width:200 editable
            └── c "C" width:200 editable
        `);
        await new GridRows(api, `tabbing forward from an editing formula cell commits it and moves focus right setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:r1 row-number:"1" a:5 b:0 c:0
            `);

        const started = waitForEvent('cellEditingStarted', api);
        api.startEditingCell({ rowIndex: 0, colKey: 'b' });
        await started;

        const [editor] = api.getCellEditorInstances() as unknown as [
            { agSetEditValue?: (v: unknown) => void; getValidationElement?: () => HTMLElement },
        ];
        editor?.agSetEditValue?.('=REF(COLUMN("a"),ROW("r1"))*2');

        const contentEl = editor?.getValidationElement?.();
        contentEl?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));

        const rowNode = api.getRowNode('r1')!;
        await waitFor(() => expect(api.getCellValue({ rowNode, colKey: 'b', useFormatter: false })).toBe(10));
        expect(api.getFocusedCell()?.column.getColId()).toBe('c');
        await new GridRows(
            api,
            `tabbing forward from an editing formula cell commits it and moves focus right final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ id:r1 row-number:"1" a:5 b:10 c:0
        `);
    });

    test('tabbing backward via Shift+Tab from an editing formula cell commits and moves left', async () => {
        const api = await createGrid('fx-tab-backward', {
            cellSelection: true,
            rowData: [{ id: 'r1', a: 0, b: 0, c: 5 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
        });
        await new GridColumns(
            api,
            `tabbing backward via Shift+Tab from an editing formula cell commits and moves le setup`
        ).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── a "A" width:200 editable
            ├── b "B" width:200 editable
            └── c "C" width:200 editable
        `);
        await new GridRows(
            api,
            `tabbing backward via Shift+Tab from an editing formula cell commits and moves le setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" a:0 b:0 c:5
        `);

        const started = waitForEvent('cellEditingStarted', api);
        api.startEditingCell({ rowIndex: 0, colKey: 'b' });
        await started;

        const [editor] = api.getCellEditorInstances() as unknown as [
            { agSetEditValue?: (v: unknown) => void; getValidationElement?: () => HTMLElement },
        ];
        editor?.agSetEditValue?.('=REF(COLUMN("c"),ROW("r1"))+1');

        const contentEl = editor?.getValidationElement?.();
        contentEl?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));

        const rowNode = api.getRowNode('r1')!;
        await waitFor(() => expect(api.getCellValue({ rowNode, colKey: 'b', useFormatter: false })).toBe(6));
        expect(api.getFocusedCell()?.column.getColId()).toBe('a');
        await new GridRows(
            api,
            `tabbing backward via Shift+Tab from an editing formula cell commits and moves le final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ id:r1 row-number:"1" a:0 b:6 c:5
        `);
    });

    test('closing one formula editor and opening another does not leak active-editor state', async () => {
        const api = await createGrid('fx-editor-handoff', {
            cellSelection: true,
            rowData: [
                { id: 'r1', a: 2, b: 0 },
                { id: 'r2', a: 3, b: 0 },
            ],
            columnDefs: [{ field: 'a' }, { field: 'b' }],
        });

        let started = waitForEvent('cellEditingStarted', api);
        api.startEditingCell({ rowIndex: 0, colKey: 'b' });
        await started;

        let [editor] = api.getCellEditorInstances() as unknown as [{ agSetEditValue?: (v: unknown) => void }];
        editor?.agSetEditValue?.('=REF(COLUMN("a"),ROW("r1"))*10');

        let stopped = waitForEvent('cellEditingStopped', api);
        api.stopEditing(false);
        await stopped;

        started = waitForEvent('cellEditingStarted', api);
        api.startEditingCell({ rowIndex: 1, colKey: 'b' });
        await started;

        [editor] = api.getCellEditorInstances() as unknown as [{ agSetEditValue?: (v: unknown) => void }];
        editor?.agSetEditValue?.('=REF(COLUMN("a"),ROW("r2"))*100');

        stopped = waitForEvent('cellEditingStopped', api);
        api.stopEditing(false);
        await stopped;

        await new GridRows(api, 'both cells edited', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" a:2 b:20
            └── LEAF id:r2 row-number:"2" a:3 b:300
        `);
    });
    // AG-18276: bulk edit (Ctrl+Enter) of a formula across a cell range - `applyBulkEdit` is reachable
    // only from the cell's Enter handler. The value is set through the editor instance, as the other
    // formula tests here do, the formula editor being no plain input.
    async function bulkEditFormula(
        api: GridApi,
        rowIndex: number,
        formula: string,
        ranges: { rowStartIndex: number; rowEndIndex: number; columns: string[] }[]
    ) {
        const started = waitForEvent('cellEditingStarted', api);
        api.setFocusedCell(rowIndex, 'total');
        api.startEditingCell({ rowIndex, colKey: 'total' });
        await started;

        // The ranges must be added before the value: an open formula editor treats a new cell range
        // as a reference to insert, which would prefix the typed formula. `addCellRange` appends, so
        // clear first or the cell that started editing stays in the set as its own range.
        api.clearCellSelection();
        for (const range of ranges) {
            api.addCellRange(range);
        }

        const [editor] = api.getCellEditorInstances() as unknown as [
            { agSetEditValue?: (v: unknown) => void; getValidationElement?: () => HTMLElement },
        ];
        editor?.agSetEditValue?.(formula);

        const contentEl = editor?.getValidationElement?.();
        contentEl?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true }));
        await asyncSetTimeout(0);
    }

    // `a_i + b_j = i + 10j` is injective over these rows, so any wrong row reference produces a value
    // distinct from every correct one.
    const bulkEditRowData = (count: number) =>
        Array.from({ length: count }, (_, i) => ({ id: `r${i + 1}`, a: i + 1, b: (i + 1) * 10, total: null }));

    const bulkEditColumnDefs = [{ field: 'a', filter: 'agNumberColumnFilter' }, { field: 'b' }, { field: 'total' }];

    test('bulk edit offsets formula refs by the target row when a filter is active', async () => {
        const api = await createGrid('fx-bulk-edit-filtered', {
            cellSelection: true,
            rowData: bulkEditRowData(6),
            columnDefs: bulkEditColumnDefs,
        });

        // Hide r2 and r4 so the visible rows are non-consecutive in formulaRows space.
        const filterChanged = waitForEvent('filterChanged', api);
        api.setFilterModel({
            a: {
                filterType: 'number',
                operator: 'OR',
                conditions: [
                    { filterType: 'number', type: 'equals', filter: 1 },
                    { filterType: 'number', type: 'equals', filter: 3 },
                    { filterType: 'number', type: 'equals', filter: 5 },
                    { filterType: 'number', type: 'equals', filter: 6 },
                ],
            },
        });
        await filterChanged;

        await new GridRows(api, 'before bulk edit (filtered)', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" a:1 b:10 total:null
            ├── LEAF id:r3 row-number:"3" a:3 b:30 total:null
            ├── LEAF id:r5 row-number:"5" a:5 b:50 total:null
            └── LEAF id:r6 row-number:"6" a:6 b:60 total:null
        `);

        await bulkEditFormula(api, 0, '=REF(COLUMN("a"),ROW("r1"))+REF(COLUMN("b"),ROW("r1"))', [
            { rowStartIndex: 0, rowEndIndex: 3, columns: ['total'] },
        ]);

        // Each row's formula references its own row, not one step per visited row (which would give
        // r3:22, r5:33, r6:44).
        await new GridRows(api, 'after bulk edit (filtered)', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" a:1 b:10 total:11
            ├── LEAF id:r3 row-number:"3" a:3 b:30 total:33
            ├── LEAF id:r5 row-number:"5" a:5 b:50 total:55
            └── LEAF id:r6 row-number:"6" a:6 b:60 total:66
        `);

        // The filtered-out rows are not in the range, so they are never written to.
        for (const id of ['r2', 'r4']) {
            const node = api.getRowNode(id)!;
            expect(api.getCellValue({ rowNode: node, colKey: 'total', useFormatter: false })).toBeNull();
        }
    });

    test('bulk edit with no filter offsets formula refs by one row per row in the range', async () => {
        const api = await createGrid('fx-bulk-edit-unfiltered', {
            cellSelection: true,
            rowData: bulkEditRowData(4),
            columnDefs: bulkEditColumnDefs,
        });

        await bulkEditFormula(api, 0, '=REF(COLUMN("a"),ROW("r1"))+REF(COLUMN("b"),ROW("r1"))', [
            { rowStartIndex: 0, rowEndIndex: 3, columns: ['total'] },
        ]);

        // Consecutive displayed rows are consecutive in formula-row space, so this is unchanged.
        await new GridRows(api, 'after bulk edit (unfiltered)', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" a:1 b:10 total:11
            ├── LEAF id:r2 row-number:"2" a:2 b:20 total:22
            ├── LEAF id:r3 row-number:"3" a:3 b:30 total:33
            └── LEAF id:r4 row-number:"4" a:4 b:40 total:44
        `);
    });

    test('bulk edit across two ranges restarts the formula offset at each range', async () => {
        const api = await createGrid('fx-bulk-edit-multi-range', {
            cellSelection: true,
            rowData: bulkEditRowData(4),
            columnDefs: bulkEditColumnDefs,
        });

        await bulkEditFormula(api, 0, '=REF(COLUMN("a"),ROW("r1"))+REF(COLUMN("b"),ROW("r1"))', [
            { rowStartIndex: 0, rowEndIndex: 1, columns: ['total'] },
            { rowStartIndex: 3, rowEndIndex: 3, columns: ['total'] },
        ]);

        // The offset is measured from each range's own start row, so r4 - the start of the second
        // range - takes the typed formula unshifted (11) rather than continuing the first range's
        // progression (which would give 33). Deliberate: a non-accumulating offset cannot continue
        // across ranges, and `getCellRanges()` returns creation order, so accumulating would go
        // negative for a later range sitting above an earlier one.
        await new GridRows(api, 'after bulk edit across two ranges', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" a:1 b:10 total:11
            ├── LEAF id:r2 row-number:"2" a:2 b:20 total:22
            ├── LEAF id:r3 row-number:"3" a:3 b:30 total:null
            └── LEAF id:r4 row-number:"4" a:4 b:40 total:11
        `);
    });

    test('bulk edit measures the formula offset from the top of the range, not the edited cell', async () => {
        const api = await createGrid('fx-bulk-edit-anchor-mid-range', {
            cellSelection: true,
            rowData: bulkEditRowData(6),
            columnDefs: bulkEditColumnDefs,
        });

        // The edited cell is the third row of a range that starts at r1.
        await bulkEditFormula(api, 2, '=REF(COLUMN("a"),ROW("r3"))+REF(COLUMN("b"),ROW("r3"))', [
            { rowStartIndex: 0, rowEndIndex: 3, columns: ['total'] },
        ]);

        // Pre-existing behaviour, preserved deliberately: the range's start row keeps the typed
        // formula and every row below it - including the edited cell itself - is shifted by its
        // offset from the range top, so r3 ends up referencing r5.
        await new GridRows(api, 'after bulk edit (anchor mid-range)', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" a:1 b:10 total:33
            ├── LEAF id:r2 row-number:"2" a:2 b:20 total:44
            ├── LEAF id:r3 row-number:"3" a:3 b:30 total:55
            ├── LEAF id:r4 row-number:"4" a:4 b:40 total:66
            ├── LEAF id:r5 row-number:"5" a:5 b:50 total:null
            └── LEAF id:r6 row-number:"6" a:6 b:60 total:null
        `);
    });
});
