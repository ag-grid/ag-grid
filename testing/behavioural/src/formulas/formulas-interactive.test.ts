import { getByTestId } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import type { GridOptions, Module } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    TextEditorModule,
    UndoRedoEditModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import { BatchEditModule, CellSelectionModule, ClipboardModule, FormulaModule } from 'ag-grid-enterprise';

import {
    GridColumns,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    clipboardUtils,
    initPointerEventPolyfill,
    waitForEvent,
} from '../test-utils';

describe('ag-grid formulas interactive workflows', () => {
    const gridRowsOpts = { useFormatter: false } as const;

    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            FormulaModule,
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
        await asyncSetTimeout(5);

        const r2 = api.getRowNode('r2')!;
        expect(api.getCellValue({ rowNode: r2, colKey: 'out', useFormatter: false })).toBe(12);

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
        await asyncSetTimeout(1);

        const fillHandle = getByTestId(gridDiv, agTestIdFor.fillHandle());
        const fillEnd = waitForEvent('fillEnd', api);
        await userEvent.dblClick(fillHandle);
        await fillEnd;
        await asyncSetTimeout(5);

        await new GridRows(api, 'after fill down', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" a:1 b:10 total:11
            ├── LEAF id:r2 row-number:"2" a:2 b:20 total:22
            ├── LEAF id:r3 row-number:"3" a:3 b:30 total:33
            └── LEAF id:r4 row-number:"4" a:4 b:40 total:44
        `);
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
        await asyncSetTimeout(1);

        api.commitBatchEdit();
        expect(api.isBatchEditing()).toBe(false);
        await asyncSetTimeout(5);

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
        await asyncSetTimeout(1);

        api.cancelBatchEdit();
        await asyncSetTimeout(5);

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
        await asyncSetTimeout(5);

        const rowNode = api.getRowNode('r1')!;
        expect(api.getCellValue({ rowNode, colKey: 'b', useFormatter: false })).toBe(10);
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
        await asyncSetTimeout(5);

        const rowNode = api.getRowNode('r1')!;
        expect(api.getCellValue({ rowNode, colKey: 'b', useFormatter: false })).toBe(6);
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
        await asyncSetTimeout(5);

        started = waitForEvent('cellEditingStarted', api);
        api.startEditingCell({ rowIndex: 1, colKey: 'b' });
        await started;

        [editor] = api.getCellEditorInstances() as unknown as [{ agSetEditValue?: (v: unknown) => void }];
        editor?.agSetEditValue?.('=REF(COLUMN("a"),ROW("r2"))*100');

        stopped = waitForEvent('cellEditingStopped', api);
        api.stopEditing(false);
        await stopped;
        await asyncSetTimeout(5);

        await new GridRows(api, 'both cells edited', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" a:2 b:20
            └── LEAF id:r2 row-number:"2" a:3 b:300
        `);
    });
});
