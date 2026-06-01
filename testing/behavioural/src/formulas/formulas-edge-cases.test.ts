import { vi } from 'vitest';

import type { FormulaDataSource, FormulaFunctionParams, GridOptions, Module, RowNode } from 'ag-grid-community';
import { ClientSideRowModelModule, PinnedRowModule, TextEditorModule, UndoRedoEditModule } from 'ag-grid-community';
import { FormulaModule } from 'ag-grid-enterprise';

import {
    GridColumns,
    GridRows,
    TestGridsManager,
    applyTransactionChecked,
    asyncSetTimeout,
    waitForEvent,
} from '../test-utils';

describe('ag-grid formulas edge cases', () => {
    const rowNumberRefreshBufferMs = 25;
    const gridRowsOpts = { useFormatter: false } as const;

    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            FormulaModule,
            PinnedRowModule,
            TextEditorModule,
            UndoRedoEditModule,
        ] as Module[],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    function createGrid(id: string, opts: Partial<GridOptions>) {
        const options: GridOptions = {
            defaultColDef: { allowFormula: true },
            getRowId: (params) => params.data?.id,
            ...opts,
        };
        return gridsManager.createGrid(id, options);
    }

    test('division by zero via intermediate arithmetic yields #DIV/0!', async () => {
        const api = createGrid('edge-div0-intermediate', {
            rowData: [
                { id: 'a', value: 5 },
                { id: 'dep', value: '=1/(REF(COLUMN("value"),ROW("a"))-5)' },
            ],
            columnDefs: [{ field: 'value' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'div by zero via expression', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:a row-number:"1" value:5
            └── LEAF id:dep row-number:"2" value:"#DIV/0!"
        `);
    });

    test('unknown function name yields #NAME?', async () => {
        const api = createGrid('edge-unknown-func', {
            rowData: [{ id: 'r1', value: '=NOSUCHFUNC(1,2)' }],
            columnDefs: [{ field: 'value' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'unknown function', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" value:"#NAME?"
        `);
    });

    test('reference to non-existent row id yields #REF!', async () => {
        const api = createGrid('edge-missing-row', {
            rowData: [{ id: 'r1', value: '=REF(COLUMN("value"),ROW("nope"))' }],
            columnDefs: [{ field: 'value' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'missing row ref', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" value:"#REF!"
        `);
    });

    test('reference to non-existent column id yields #REF!', async () => {
        const api = createGrid('edge-missing-col', {
            rowData: [{ id: 'r1', a: 1, value: '=REF(COLUMN("nosuch"),ROW("r1"))' }],
            columnDefs: [{ field: 'a' }, { field: 'value' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'missing column ref', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" a:1 value:"#REF!"
        `);
    });

    test('absolute row reference beyond row count yields #REF!', async () => {
        const api = createGrid('edge-absolute-row-oob', {
            rowData: [
                { id: 'r1', value: 1 },
                { id: 'r2', value: '=REF(COLUMN("A",true),ROW("99",true))' },
            ],
            columnDefs: [{ field: 'value' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'absolute row out of bounds', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" value:1
            └── LEAF id:r2 row-number:"2" value:"#REF!"
        `);
    });

    test('bare range as a whole formula yields #ERROR!', async () => {
        const api = createGrid('edge-range-scalar', {
            rowData: [
                { id: 'r1', value: 1 },
                { id: 'r2', value: 2 },
                {
                    id: 'bad',
                    value: '=REF(COLUMN("value"),ROW("r1"),COLUMN("value"),ROW("r2"))',
                },
            ],
            columnDefs: [{ field: 'value' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'bare range in scalar context', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" value:1
            ├── LEAF id:r2 row-number:"2" value:2
            └── LEAF id:bad row-number:"3" value:"#ERROR!"
        `);
    });

    test('malformed formula yields #PARSE!', async () => {
        const api = createGrid('edge-parse-error', {
            rowData: [{ id: 'r1', value: '=1+' }],
            columnDefs: [{ field: 'value' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'trailing operator parses as error', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" value:"#PARSE!"
        `);
    });

    test('range formula re-evaluates when a middle row changes value', async () => {
        const api = createGrid('edge-range-mid-update', {
            rowData: [
                { id: 'a', value: 10 },
                { id: 'b', value: 20 },
                { id: 'c', value: 30 },
                { id: 'total', value: '=SUM(REF(COLUMN("value"),ROW("a"),COLUMN("value"),ROW("c")))' },
            ],
            columnDefs: [{ field: 'value' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'initial sum', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:a row-number:"1" value:10
            ├── LEAF id:b row-number:"2" value:20
            ├── LEAF id:c row-number:"3" value:30
            └── LEAF id:total row-number:"4" value:60
        `);

        applyTransactionChecked(api, { update: [{ id: 'b', value: 200 }] });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'middle row updated', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:a row-number:"1" value:10
            ├── LEAF id:b row-number:"2" value:200
            ├── LEAF id:c row-number:"3" value:30
            └── LEAF id:total row-number:"4" value:240
        `);
    });

    test('range formula pointing at a deleted endpoint yields #REF!', async () => {
        const api = createGrid('edge-range-missing-end', {
            rowData: [
                { id: 'a', value: 1 },
                { id: 'b', value: 2 },
                { id: 'c', value: 3 },
                { id: 'total', value: '=SUM(REF(COLUMN("value"),ROW("a"),COLUMN("value"),ROW("c")))' },
            ],
            columnDefs: [{ field: 'value' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        applyTransactionChecked(api, { remove: [{ id: 'c' }] });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'end removed', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:a row-number:"1" value:1
            ├── LEAF id:b row-number:"2" value:2
            └── LEAF id:total row-number:"3" value:"#REF!"
        `);
    });

    test('removing rows inside a range shrinks the range but preserves the endpoints', async () => {
        const api = createGrid('edge-range-middle-remove', {
            rowData: [
                { id: 'v1', value: 1 },
                { id: 'v2', value: 2 },
                { id: 'v3', value: 3 },
                { id: 'v4', value: 4 },
                { id: 'total', value: '=SUM(REF(COLUMN("value"),ROW("v1"),COLUMN("value"),ROW("v4")))' },
            ],
            columnDefs: [{ field: 'value' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'full range', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:v1 row-number:"1" value:1
            ├── LEAF id:v2 row-number:"2" value:2
            ├── LEAF id:v3 row-number:"3" value:3
            ├── LEAF id:v4 row-number:"4" value:4
            └── LEAF id:total row-number:"5" value:10
        `);

        applyTransactionChecked(api, { remove: [{ id: 'v2' }, { id: 'v3' }] });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'after removing v2 and v3', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:v1 row-number:"1" value:1
            ├── LEAF id:v4 row-number:"2" value:4
            └── LEAF id:total row-number:"3" value:5
        `);
    });

    test('hiding a referenced column does not break relative refs', async () => {
        const rowData = [{ id: 'r1', a: 2, b: 3, out: '=REF(COLUMN("a"),ROW("r1"))+REF(COLUMN("b"),ROW("r1"))' }];
        const api = createGrid('edge-hide-col', {
            rowData,
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'out' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'all visible', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" a:2 b:3 out:5
        `);

        api.setColumnsVisible(['a'], false);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'a hidden', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" a:2 b:3 out:5
        `);

        api.setColumnsVisible(['a'], true);
        applyTransactionChecked(api, { update: [{ id: 'r1', a: 7, b: 3, out: rowData[0].out }] });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'a shown again after update', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" a:7 b:3 out:10
        `);
    });

    test('pinning a referenced column does not change formula results', async () => {
        const api = createGrid('edge-pin-col', {
            rowData: [{ id: 'r1', a: 4, b: 5, out: '=REF(COLUMN("a"),ROW("r1"))*REF(COLUMN("b"),ROW("r1"))' }],
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'out' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'unpinned', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" a:4 b:5 out:20
        `);

        api.applyColumnState({ state: [{ colId: 'a', pinned: 'left' }] });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'a pinned left', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" a:4 b:5 out:20
        `);
    });

    test('custom function throwing a plain Error yields #ERROR!', async () => {
        const api = createGrid('edge-custom-error', {
            rowData: [{ id: 'r1', v: 1, out: '=BOOM(REF(COLUMN("v"),ROW("r1")))' }],
            columnDefs: [{ field: 'v' }, { field: 'out' }],
            formulaFuncs: {
                BOOM: {
                    func: () => {
                        throw new Error('kaboom');
                    },
                },
            },
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'custom plain error', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" v:1 out:"#ERROR!"
        `);
    });

    test('custom function receiving too many arguments surfaces its own validation error', async () => {
        const api = createGrid('edge-custom-arity', {
            rowData: [{ id: 'r1', v: 1, out: '=ONLYONE(1,2)' }],
            columnDefs: [{ field: 'v' }, { field: 'out' }],
            formulaFuncs: {
                ONLYONE: {
                    func: (params: FormulaFunctionParams) => {
                        const args = Array.from(params.args);
                        if (args.length !== 1) {
                            throw new Error(`ONLYONE expects 1 arg, got ${args.length}`);
                        }
                        return args[0].kind === 'value' ? (args[0].value as number) : null;
                    },
                },
            },
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'custom arity error', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" v:1 out:"#ERROR!"
        `);
    });

    test('mutually referencing cells both report #CIRCREF!', async () => {
        const api = createGrid('edge-mutual-cycle', {
            rowData: [
                { id: 'r1', value: '=REF(COLUMN("value"),ROW("r2"))' },
                { id: 'r2', value: '=REF(COLUMN("value"),ROW("r1"))' },
            ],
            columnDefs: [{ field: 'value' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'mutual cycle', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" value:"#CIRCREF!"
            └── LEAF id:r2 row-number:"2" value:"#CIRCREF!"
        `);
    });

    test('self-referencing cell reports #CIRCREF!', async () => {
        const api = createGrid('edge-self-cycle', {
            rowData: [{ id: 'r1', value: '=REF(COLUMN("value"),ROW("r1"))+1' }],
            columnDefs: [{ field: 'value' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'self cycle', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" value:"#CIRCREF!"
        `);
    });

    test('removing and re-inserting a row at a new position via a single transaction', async () => {
        const api = createGrid('edge-row-move', {
            rowData: [
                { id: 'a', value: 10 },
                { id: 'b', value: 20 },
                { id: 'dep', value: '=REF(COLUMN("value"),ROW("a"))+REF(COLUMN("value"),ROW("b"))' },
            ],
            columnDefs: [{ field: 'value' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'initial', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:a row-number:"1" value:10
            ├── LEAF id:b row-number:"2" value:20
            └── LEAF id:dep row-number:"3" value:30
        `);

        applyTransactionChecked(api, {
            remove: [{ id: 'a' }],
            add: [{ id: 'a', value: 99 }],
            addIndex: 2,
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'after remove+add same id', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:b row-number:"1" value:20
            ├── LEAF id:dep row-number:"2" value:119
            └── LEAF id:a row-number:"3" value:99
        `);
    });

    test('cell editor displays REF longhand formulas as A1 shorthand', async () => {
        const longhand = '=REF(COLUMN("a"),ROW("r1"))+REF(COLUMN("b"),ROW("r1"))';
        const api = createGrid('edge-editor-shorthand', {
            rowData: [{ id: 'r1', a: 10, b: 20, out: longhand }],
            columnDefs: [
                { field: 'a', editable: true },
                { field: 'b', editable: true },
                { field: 'out', editable: true },
            ],
        });
        await new GridColumns(api, `cell editor displays REF longhand formulas as A1 shorthand setup`).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── a "A" width:200 editable
            ├── b "B" width:200 editable
            └── out "Out" width:200 editable
        `);
        await new GridRows(api, `cell editor displays REF longhand formulas as A1 shorthand setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" a:10 b:20 out:30
        `);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        const editingStarted = waitForEvent('cellEditingStarted', api);
        api.startEditingCell({ rowIndex: 0, colKey: 'out' });
        await editingStarted;

        const [editor] = api.getCellEditorInstances();
        const editorValue = editor?.getValue();

        expect(typeof editorValue).toBe('string');
        expect(editorValue as string).not.toContain('REF(');
        expect(editorValue as string).not.toContain('COLUMN(');
        expect(editorValue as string).toMatch(/A1/);
        expect(editorValue as string).toMatch(/B1/);

        const editingStopped = waitForEvent('cellEditingStopped', api);
        api.stopEditing(false);
        await editingStopped;
        await new GridRows(api, `cell editor displays REF longhand formulas as A1 shorthand final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" a:10 b:20 out:30
        `);
    });

    test('committing a shorthand formula via the editor normalises the stored value to REF longhand', async () => {
        const api = createGrid('edge-editor-commit-normalise', {
            rowData: [{ id: 'r1', a: 3, b: 4, out: 0 }],
            columnDefs: [
                { field: 'a', editable: true },
                { field: 'b', editable: true },
                { field: 'out', editable: true },
            ],
        });
        await new GridColumns(
            api,
            `committing a shorthand formula via the editor normalises the stored value to REF setup`
        ).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── a "A" width:200 editable
            ├── b "B" width:200 editable
            └── out "Out" width:200 editable
        `);
        await new GridRows(
            api,
            `committing a shorthand formula via the editor normalises the stored value to REF setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" a:3 b:4 out:0
        `);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        const editingStarted = waitForEvent('cellEditingStarted', api);
        api.startEditingCell({ rowIndex: 0, colKey: 'out' });
        await editingStarted;

        const [editor] = api.getCellEditorInstances() as unknown as [
            { agSetEditValue?: (v: unknown) => void; getValue: () => unknown },
        ];
        editor?.agSetEditValue?.('=A1*B1');

        const editingStopped = waitForEvent('cellEditingStopped', api);
        api.stopEditing(false);
        await editingStopped;
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        const stored = api.getRowNode('r1')?.data?.out as string;
        expect(typeof stored).toBe('string');
        expect(stored).toContain('REF(');
        expect(stored).toContain('COLUMN(');
        expect(stored).toContain('ROW(');
        expect(stored).not.toBe('=A1*B1');

        const rowNode = api.getRowNode('r1')!;
        expect(api.getCellValue({ rowNode, colKey: 'out', useFormatter: false })).toBe(12);
        await new GridRows(
            api,
            `committing a shorthand formula via the editor normalises the stored value to REF final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" a:3 b:4 out:12
        `);
    });

    test('committing invalid formula text preserves the raw input unchanged', async () => {
        const api = createGrid('edge-editor-invalid', {
            rowData: [{ id: 'r1', out: '=1+1' }],
            columnDefs: [{ field: 'out', editable: true }],
        });
        await new GridColumns(api, `committing invalid formula text preserves the raw input unchanged setup`)
            .checkColumns(`
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                └── out "Out" width:200 editable
            `);
        await new GridRows(api, `committing invalid formula text preserves the raw input unchanged setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" out:2
        `);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        const editingStarted = waitForEvent('cellEditingStarted', api);
        api.startEditingCell({ rowIndex: 0, colKey: 'out' });
        await editingStarted;

        const [editor] = api.getCellEditorInstances() as unknown as [{ agSetEditValue?: (v: unknown) => void }];
        editor?.agSetEditValue?.('=1+');

        const editingStopped = waitForEvent('cellEditingStopped', api);
        api.stopEditing(false);
        await editingStopped;
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        expect(api.getRowNode('r1')?.data?.out).toBe('=1+');
        await new GridRows(api, `committing invalid formula text preserves the raw input unchanged final state`).check(
            `
                ROOT id:ROOT_NODE_ID
                └── LEAF id:r1 row-number:"1" out:"#PARSE!"
            `
        );
    });

    test('cancelling a formula edit with stopEditing(true) leaves the cell untouched', async () => {
        const api = createGrid('edge-editor-cancel', {
            rowData: [{ id: 'r1', a: 2, b: 3, out: '=REF(COLUMN("a"),ROW("r1"))+REF(COLUMN("b"),ROW("r1"))' }],
            columnDefs: [
                { field: 'a', editable: true },
                { field: 'b', editable: true },
                { field: 'out', editable: true },
            ],
        });
        await new GridColumns(api, `cancelling a formula edit with stopEditing(true) leaves the cell untouched setup`)
            .checkColumns(`
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                ├── a "A" width:200 editable
                ├── b "B" width:200 editable
                └── out "Out" width:200 editable
            `);
        await new GridRows(api, `cancelling a formula edit with stopEditing(true) leaves the cell untouched setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:r1 row-number:"1" a:2 b:3 out:5
            `);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        const before = api.getRowNode('r1')?.data?.out;

        const editingStarted = waitForEvent('cellEditingStarted', api);
        api.startEditingCell({ rowIndex: 0, colKey: 'out' });
        await editingStarted;

        const [editor] = api.getCellEditorInstances() as unknown as [{ agSetEditValue?: (v: unknown) => void }];
        editor?.agSetEditValue?.('=A1*B1*100');

        const editingStopped = waitForEvent('cellEditingStopped', api);
        api.stopEditing(true);
        await editingStopped;
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        expect(api.getRowNode('r1')?.data?.out).toBe(before);
        const rowNode = api.getRowNode('r1')!;
        expect(api.getCellValue({ rowNode, colKey: 'out', useFormatter: false })).toBe(5);
        await new GridRows(
            api,
            `cancelling a formula edit with stopEditing(true) leaves the cell untouched final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" a:2 b:3 out:5
        `);
    });

    test('serializer output covers operand types, precedence and parens branches', async () => {
        const api = createGrid('edge-serializer-shapes', {
            rowData: [
                { id: 'r1', a: 1, b: 2, c: 3, x: null },
                { id: 'r2', a: 10, b: 20, c: 30, x: null },
            ],
            columnDefs: [
                { field: 'a', editable: true },
                { field: 'b', editable: true },
                { field: 'c', editable: true },
                { field: 'x', editable: true },
            ],
        });
        await new GridColumns(api, `serializer output covers operand types, precedence and parens branches setup`)
            .checkColumns(`
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                ├── a "A" width:200 editable
                ├── b "B" width:200 editable
                ├── c "C" width:200 editable
                └── x "X" width:200 editable
            `);
        await new GridRows(api, `serializer output covers operand types, precedence and parens branches setup`).check(
            `
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:r1 row-number:"1" a:1 b:2 c:3 x:null
                └── LEAF id:r2 row-number:"2" a:10 b:20 c:30 x:null
            `
        );
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        const commitAndRead = async (input: string): Promise<string> => {
            const started = waitForEvent('cellEditingStarted', api);
            api.startEditingCell({ rowIndex: 0, colKey: 'x' });
            await started;
            const [editor] = api.getCellEditorInstances() as unknown as [{ agSetEditValue?: (v: unknown) => void }];
            editor?.agSetEditValue?.(input);
            const stopped = waitForEvent('cellEditingStopped', api);
            api.stopEditing(false);
            await stopped;
            await asyncSetTimeout(rowNumberRefreshBufferMs);
            return api.getRowNode('r1')?.data?.x as string;
        };

        const A = '=REF(COLUMN("a"),ROW("r1"))';
        const B = '=REF(COLUMN("b"),ROW("r1"))';
        const C = '=REF(COLUMN("c"),ROW("r1"))';
        // Unwrapped REF pieces (no leading '=') for composing expected outputs.
        const a = A.slice(1);
        const b = B.slice(1);
        const c = C.slice(1);

        const cases: [label: string, input: string, expected: string][] = [
            // --- Operand types (emit branches) -----------------------------------------------
            ['number operand', '=42', '=42'],
            ['negative number operand', '=-7', '=-7'],
            ['decimal number operand', '=3.5', '=3.5'],
            ['string operand', '="hello"', '="hello"'],
            ['boolean TRUE operand (IF branch)', '=IF(1=1,TRUE,FALSE)', '=IF(1=1,TRUE,FALSE)'],

            // --- Basic cell refs --------------------------------------------------------------
            ['relative single ref', '=A1', A],
            ['absolute col ref', '=$A1', '=REF(COLUMN("A",true),ROW("r1"))'],
            ['absolute row ref', '=A$1', '=REF(COLUMN("a"),ROW("1",true))'],
            ['fully absolute ref', '=$A$1', '=REF(COLUMN("A",true),ROW("1",true))'],

            // --- Ranges (endColumn/endRow branch) --------------------------------------------
            ['range via SUM', '=SUM(A1:B2)', '=SUM(REF(COLUMN("a"),ROW("r1"),COLUMN("b"),ROW("r2")))'],

            // --- Infix / needsParensInBinary branches ----------------------------------------
            ['binary add, same-precedence associative (no parens)', '=A1+B1+C1', `=${a}+${b}+${c}`],
            ['binary sub, left-assoc non-associative right-side parens', '=A1-(B1-C1)', `=${a}-(${b}-${c})`],
            ['binary div, left-assoc non-associative right-side parens', '=A1/(B1/C1)', `=${a}/(${b}/${c})`],
            ['mixed precedence, higher-on-right (no parens)', '=A1+B1*C1', `=${a}+${b}*${c}`],
            ['mixed precedence, higher-on-left (parens on left)', '=(A1+B1)*C1', `=(${a}+${b})*${c}`],
            ['power is right-associative (no parens)', '=A1^B1^C1', `=${a}^${b}^${c}`],
            ['power left-parens forced when same op on left', '=(A1^B1)^C1', `=(${a}^${b})^${c}`],

            // --- Unary minus (isUnaryMinusNode + needsParensForUnaryMinus branches) ----------
            ['unary minus on cell ref', '=-A1', `=-${a}`],
            ['unary minus wraps +,- inner', '=-(A1+B1)', `=-(${a}+${b})`],
            ['unary minus does NOT wrap ^ inner', '=-A1^2', `=-${a}^2`],

            // --- Postfix / prefix operator paths ---------------------------------------------
            ['postfix percent on cell', '=A1%', `=${a}%`],
            ['postfix percent on number', '=50%', '=50%'],

            // --- Function-call fallback (manual args loop, 0+/1/multi-arg) -------------------
            ['function with one arg', '=ABS(A1)', `=ABS(${a})`],
            ['function with three args', '=IF(A1,B1,C1)', `=IF(${a},${b},${c})`],
        ];

        const failures: string[] = [];
        for (const [label, input, expected] of cases) {
            const actual = await commitAndRead(input);
            if (actual !== expected) {
                failures.push(`  [${label}] input=${input}\n    expected: ${expected}\n    actual:   ${actual}`);
            }
        }
        expect(failures.join('\n')).toBe('');
        await new GridRows(api, `serializer output covers operand types, precedence and parens branches final state`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:r1 row-number:"1" a:1 b:2 c:3 x:2
                └── LEAF id:r2 row-number:"2" a:10 b:20 c:30 x:null
            `);
    });

    test('normaliseFormula is idempotent across successive edit round-trips', async () => {
        const api = createGrid('edge-editor-idempotent', {
            rowData: [{ id: 'r1', a: 1, b: 2, out: '=REF(COLUMN("a"),ROW("r1"))+REF(COLUMN("b"),ROW("r1"))' }],
            columnDefs: [
                { field: 'a', editable: true },
                { field: 'b', editable: true },
                { field: 'out', editable: true },
            ],
        });
        await new GridColumns(api, `normaliseFormula is idempotent across successive edit round-trips setup`)
            .checkColumns(`
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                ├── a "A" width:200 editable
                ├── b "B" width:200 editable
                └── out "Out" width:200 editable
            `);
        await new GridRows(api, `normaliseFormula is idempotent across successive edit round-trips setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" a:1 b:2 out:3
        `);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        const roundTrip = async (): Promise<string> => {
            const started = waitForEvent('cellEditingStarted', api);
            api.startEditingCell({ rowIndex: 0, colKey: 'out' });
            await started;
            const stopped = waitForEvent('cellEditingStopped', api);
            api.stopEditing(false); // commit unchanged - exercises normalise twice
            await stopped;
            await asyncSetTimeout(rowNumberRefreshBufferMs);
            return api.getRowNode('r1')?.data?.out as string;
        };

        const first = await roundTrip();
        const second = await roundTrip();
        const third = await roundTrip();

        expect(first).toBe(second);
        expect(second).toBe(third);
        await new GridRows(api, `normaliseFormula is idempotent across successive edit round-trips final state`).check(
            `
                ROOT id:ROOT_NODE_ID
                └── LEAF id:r1 row-number:"1" a:1 b:2 out:3
            `
        );
    });

    test('undoing a formula edit reverts to the previous formula and value', async () => {
        const original = '=REF(COLUMN("a"),ROW("r1"))+REF(COLUMN("b"),ROW("r1"))';
        const api = createGrid('edge-undo-formula', {
            rowData: [{ id: 'r1', a: 5, b: 10, out: original }],
            columnDefs: [
                { field: 'a', editable: true },
                { field: 'b', editable: true },
                { field: 'out', editable: true },
            ],
            undoRedoCellEditing: true,
        });
        await new GridColumns(api, `undoing a formula edit reverts to the previous formula and value setup`)
            .checkColumns(`
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                ├── a "A" width:200 editable
                ├── b "B" width:200 editable
                └── out "Out" width:200 editable
            `);
        await new GridRows(api, `undoing a formula edit reverts to the previous formula and value setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" a:5 b:10 out:15
        `);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        const rowNode = api.getRowNode('r1')!;
        expect(api.getCellValue({ rowNode, colKey: 'out', useFormatter: false })).toBe(15);

        const started = waitForEvent('cellEditingStarted', api);
        api.startEditingCell({ rowIndex: 0, colKey: 'out' });
        await started;
        const [editor] = api.getCellEditorInstances() as unknown as [{ agSetEditValue?: (v: unknown) => void }];
        editor?.agSetEditValue?.('=A1*B1');
        const stopped = waitForEvent('cellEditingStopped', api);
        api.stopEditing(false);
        await stopped;
        await asyncSetTimeout(rowNumberRefreshBufferMs);
        expect(api.getCellValue({ rowNode, colKey: 'out', useFormatter: false })).toBe(50);

        api.undoCellEditing();
        await asyncSetTimeout(rowNumberRefreshBufferMs);
        expect(api.getCellValue({ rowNode, colKey: 'out', useFormatter: false })).toBe(15);

        api.redoCellEditing();
        await asyncSetTimeout(rowNumberRefreshBufferMs);
        expect(api.getCellValue({ rowNode, colKey: 'out', useFormatter: false })).toBe(50);
        await new GridRows(api, `undoing a formula edit reverts to the previous formula and value final state`).check(
            `
                ROOT id:ROOT_NODE_ID
                └── LEAF id:r1 row-number:"1" a:5 b:10 out:50
            `
        );
    });

    test('formulaDataSource provides formula strings out-of-band from row data', async () => {
        const formulas = new Map<string, string>([
            ['r1-out', '=REF(COLUMN("a"),ROW("r1"))*2'],
            ['r2-out', '=REF(COLUMN("a"),ROW("r2"))+100'],
        ]);
        const getFormula = vi.fn(({ column, rowNode }) => {
            const key = `${rowNode.id}-${column.getColId()}`;
            return formulas.get(key);
        });
        const setFormula = vi.fn(({ column, rowNode, formula }) => {
            const key = `${rowNode.id}-${column.getColId()}`;
            if (formula === undefined) {
                formulas.delete(key);
            } else {
                formulas.set(key, formula);
            }
        });

        const dataSource: FormulaDataSource = { getFormula, setFormula };

        const api = createGrid('edge-formula-datasource', {
            rowData: [
                { id: 'r1', a: 3, out: null },
                { id: 'r2', a: 5, out: null },
            ],
            columnDefs: [{ field: 'a' }, { field: 'out' }],
            formulaDataSource: dataSource,
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'datasource-sourced formulas', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" a:3 out:6
            └── LEAF id:r2 row-number:"2" a:5 out:105
        `);

        expect(getFormula).toHaveBeenCalled();
    });

    test('formulaDataSource.getFormula is only called for columns with allowFormula=true', async () => {
        const getFormula = vi.fn(({ rowNode, column }) =>
            rowNode.id === 'r1' && column.getColId() === 'a' ? '=1+2' : undefined
        );
        const setFormula = vi.fn();
        const dataSource: FormulaDataSource = { getFormula, setFormula };

        gridsManager.createGrid('edge-formula-datasource-allowformula-gated', {
            getRowId: (params) => params.data?.id,
            rowData: [
                { id: 'r1', a: 1, b: 2, c: 3 },
                { id: 'r2', a: 4, b: 5, c: 6 },
            ],
            columnDefs: [
                { field: 'a', allowFormula: true },
                { field: 'b' }, // no allowFormula
                { field: 'c', allowFormula: false },
            ],
            formulaDataSource: dataSource,
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        const columnsQueried = new Set(getFormula.mock.calls.map(([p]) => p.column.getColId()));
        expect(columnsQueried.has('a')).toBe(true);
        expect(columnsQueried.has('b')).toBe(false);
        expect(columnsQueried.has('c')).toBe(false);
    });

    test('formulas can reference non-allowFormula columns without triggering getFormula on them', async () => {
        const getFormula = vi.fn(({ rowNode, column }) =>
            rowNode.id === 'r1' && column.getColId() === 'out' ? '=REF(COLUMN("plain"),ROW("r1"))*2' : undefined
        );
        const setFormula = vi.fn();
        const dataSource: FormulaDataSource = { getFormula, setFormula };

        const api = gridsManager.createGrid('edge-formula-refs-plain-col', {
            getRowId: (params) => params.data?.id,
            rowData: [{ id: 'r1', plain: 7, out: null }],
            columnDefs: [
                { field: 'plain' }, // NOT allowFormula — only read by REF, never queried via getFormula
                { field: 'out', allowFormula: true },
            ],
            formulaDataSource: dataSource,
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'formula reads raw value from non-formula column', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" plain:7 out:14
        `);

        const columnsQueried = new Set(getFormula.mock.calls.map(([p]) => p.column.getColId()));
        expect(columnsQueried.has('out')).toBe(true);
        expect(columnsQueried.has('plain')).toBe(false);
    });

    test('plain-value cells in allowFormula columns cache their "not a formula" result (no re-query per dep lookup)', async () => {
        const getFormula = vi.fn(({ rowNode, column }) => {
            const colId = column.getColId();
            if (colId === 'b1' && rowNode.id === 'r1') {
                return '=REF(COLUMN("a"),ROW("r1"))*2';
            }
            if (colId === 'b2' && rowNode.id === 'r1') {
                return '=REF(COLUMN("a"),ROW("r1"))+10';
            }
            if (colId === 'b3' && rowNode.id === 'r1') {
                return '=REF(COLUMN("a"),ROW("r1"))-5';
            }
            return undefined;
        });
        const dataSource: FormulaDataSource = { getFormula, setFormula: vi.fn() };

        const api = gridsManager.createGrid('edge-negative-cache', {
            getRowId: (params) => params.data?.id,
            rowData: [{ id: 'r1', a: 7, b1: null, b2: null, b3: null }],
            columnDefs: [
                { field: 'a', allowFormula: true },
                { field: 'b1', allowFormula: true },
                { field: 'b2', allowFormula: true },
                { field: 'b3', allowFormula: true },
            ],
            formulaDataSource: dataSource,
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'shared plain-value reference', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" a:7 b1:14 b2:17 b3:2
        `);

        const aR1Calls = getFormula.mock.calls.filter(([p]) => p.column.getColId() === 'a' && p.rowNode.id === 'r1');
        expect(aR1Calls.length).toBe(1);
    });

    test('plain-text "=..." values on non-formula columns are not parsed as formulas', async () => {
        const api = gridsManager.createGrid('edge-plain-text-equals-on-non-formula-col', {
            getRowId: (params) => params.data?.id,
            rowData: [{ id: 'r1', formulaCol: '=1+2', textCol: '=1+2' }],
            columnDefs: [
                { field: 'formulaCol', allowFormula: true },
                { field: 'textCol' }, // no allowFormula — the `=` prefix must NOT be interpreted
            ],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'non-formula column preserves "=" prefix', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" formulaCol:3 textCol:"=1+2"
        `);
    });

    test('REF into a non-allowFormula column with a "=..." raw value returns the literal string', async () => {
        const api = gridsManager.createGrid('edge-ref-non-allowformula-col-equals-text', {
            getRowId: (params) => params.data?.id,
            rowData: [{ id: 'r1', textCol: '=1+2', out: '=REF(COLUMN("textCol"),ROW("r1"))' }],
            columnDefs: [
                { field: 'textCol' }, // NOT allowFormula — "=1+2" must NOT be re-parsed
                { field: 'out', allowFormula: true },
            ],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'REF reads raw string from non-formula column', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" textCol:"=1+2" out:"=1+2"
        `);
    });

    describe('api.refreshFormulas', () => {
        type StoreKey = `${string}:${string}`;
        const k = (rowId: string, colId: string): StoreKey => `${rowId}:${colId}`;

        /**
         * Build a grid whose `out` column formula comes from an external store. Mutating the
         * store alone does not reach the grid until `refreshFormulas` (or another invalidation
         * event) runs — that's exactly what these tests exercise.
         */
        function createRefreshFixture(testId: string, initial: Record<StoreKey, string>) {
            const store = new Map<string, string>(Object.entries(initial));
            const getFormula = vi.fn(({ rowNode, column }) => store.get(k(rowNode.id!, column.getColId())));
            const dataSource: FormulaDataSource = { getFormula, setFormula: vi.fn() };

            const api = gridsManager.createGrid(testId, {
                getRowId: (params) => params.data?.id,
                rowData: [
                    { id: 'r1', out: null },
                    { id: 'r2', out: null },
                ],
                columnDefs: [{ field: 'out', allowFormula: true }],
                formulaDataSource: dataSource,
            });
            return { api, store, getFormula };
        }

        test('no-arg call invalidates the whole cache and re-queries every cell', async () => {
            const { api, store, getFormula } = createRefreshFixture('api-refresh-all', {
                [k('r1', 'out')]: '=1+2',
                [k('r2', 'out')]: '=10+20',
            });
            await asyncSetTimeout(rowNumberRefreshBufferMs);

            await new GridRows(api, 'initial formulas', gridRowsOpts).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:r1 row-number:"1" out:3
                └── LEAF id:r2 row-number:"2" out:30
            `);

            getFormula.mockClear();
            store.set(k('r1', 'out'), '=100+1');
            store.set(k('r2', 'out'), '=200+2');
            expect(api.refreshFormulas()).toBe(true);
            await asyncSetTimeout(rowNumberRefreshBufferMs);

            await new GridRows(api, 'after refreshFormulas()', gridRowsOpts).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:r1 row-number:"1" out:101
                └── LEAF id:r2 row-number:"2" out:202
            `);

            const refreshedRows = new Set(getFormula.mock.calls.map(([p]) => p.rowNode.id));
            expect(refreshedRows.has('r1')).toBe(true);
            expect(refreshedRows.has('r2')).toBe(true);
        });

        test('passing a RowNode invalidates only that row', async () => {
            const { api, store, getFormula } = createRefreshFixture('api-refresh-rownode', {
                [k('r1', 'out')]: '=1+2',
                [k('r2', 'out')]: '=10+20',
            });
            await asyncSetTimeout(rowNumberRefreshBufferMs);

            getFormula.mockClear();
            store.set(k('r1', 'out'), '=100+1');
            store.set(k('r2', 'out'), '=200+2'); // updated but NOT invalidated
            const r1 = api.getRowNode('r1')!;
            expect(api.refreshFormulas(r1)).toBe(true);
            await asyncSetTimeout(rowNumberRefreshBufferMs);

            await new GridRows(api, 'only r1 refreshed', gridRowsOpts).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:r1 row-number:"1" out:101
                └── LEAF id:r2 row-number:"2" out:30
            `);

            const refreshedRows = new Set(getFormula.mock.calls.map(([p]) => p.rowNode.id));
            expect(refreshedRows.has('r1')).toBe(true);
            expect(refreshedRows.has('r2')).toBe(false);
        });

        test('passing a row id string resolves via the row model', async () => {
            const { api, store, getFormula } = createRefreshFixture('api-refresh-rowid', {
                [k('r1', 'out')]: '=1+2',
                [k('r2', 'out')]: '=10+20',
            });
            await asyncSetTimeout(rowNumberRefreshBufferMs);

            getFormula.mockClear();
            store.set(k('r1', 'out'), '=100+1');
            store.set(k('r2', 'out'), '=200+2');
            expect(api.refreshFormulas('r2')).toBe(true);
            await asyncSetTimeout(rowNumberRefreshBufferMs);

            await new GridRows(api, 'only r2 refreshed', gridRowsOpts).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:r1 row-number:"1" out:3
                └── LEAF id:r2 row-number:"2" out:202
            `);

            const refreshedRows = new Set(getFormula.mock.calls.map(([p]) => p.rowNode.id));
            expect(refreshedRows.has('r1')).toBe(false);
            expect(refreshedRows.has('r2')).toBe(true);
        });

        test('unknown row id is a silent no-op — cached values remain stale', async () => {
            const { api, store, getFormula } = createRefreshFixture('api-refresh-unknown-id', {
                [k('r1', 'out')]: '=1+2',
                [k('r2', 'out')]: '=10+20',
            });
            await asyncSetTimeout(rowNumberRefreshBufferMs);

            getFormula.mockClear();
            store.set(k('r1', 'out'), '=100+1');
            store.set(k('r2', 'out'), '=200+2');
            expect(api.refreshFormulas('does-not-exist')).toBe(false);
            await asyncSetTimeout(rowNumberRefreshBufferMs);

            await new GridRows(api, 'unknown id: no rows refreshed', gridRowsOpts).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:r1 row-number:"1" out:3
                └── LEAF id:r2 row-number:"2" out:30
            `);
            expect(getFormula).not.toHaveBeenCalled();
        });

        test('returns false when the formula service is inactive', async () => {
            const api = gridsManager.createGrid('api-refresh-inactive', {
                getRowId: (params) => params.data?.id,
                rowData: [{ id: 'r1', value: 1 }],
                columnDefs: [{ field: 'value' }], // no allowFormula anywhere
            });
            await new GridColumns(api, `returns false when the formula service is inactive setup`).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(api, `returns false when the formula service is inactive setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:r1 value:1
            `);
            await asyncSetTimeout(rowNumberRefreshBufferMs);

            const r1 = api.getRowNode('r1')!;
            expect(api.refreshFormulas(r1)).toBe(false);
            expect(api.refreshFormulas('r1')).toBe(false);
            await new GridRows(api, `returns false when the formula service is inactive final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:r1 value:1
            `);
        });

        test('cellValueChanged walks the sibling chain — pinned cache does not diverge after a body edit', async () => {
            const store = { template: (plain: number) => `=${plain}+2` };
            const getFormula = vi.fn(({ rowNode, column }) => {
                if (column.getColId() !== 'out') {
                    return undefined;
                }
                const plainValue = Number(rowNode.data?.plain ?? 0);
                return store.template(plainValue);
            });

            const api = gridsManager.createGrid('api-cell-edit-sibling-invalidation', {
                getRowId: (params) => params.data?.id,
                rowData: [{ id: 'r1', plain: 2, out: null }],
                columnDefs: [{ field: 'plain' }, { field: 'out', allowFormula: true }],
                enableRowPinning: true,
                isRowPinned: () => 'top',
                formulaDataSource: { getFormula, setFormula: vi.fn() },
            });
            await asyncSetTimeout(rowNumberRefreshBufferMs);

            // Initial: plain=2, getFormula returns "=2+2" → out=4 on both sides.
            await new GridRows(api, 'initial', gridRowsOpts).check(`
                PINNED_TOP id:t-top-r1 row-number:"1" plain:2 out:4
                ROOT id:ROOT_NODE_ID
                └── LEAF id:r1 row-number:"1" plain:2 out:4
            `);

            const r1 = api.getRowNode('r1')!;
            r1.setDataValue('plain', 10);
            await asyncSetTimeout(rowNumberRefreshBufferMs);

            await new GridRows(api, 'after body edit — pinned matches body', gridRowsOpts).check(`
                PINNED_TOP id:t-top-r1 row-number:"1" plain:10 out:12
                ROOT id:ROOT_NODE_ID
                └── LEAF id:r1 row-number:"1" plain:10 out:12
            `);
        });

        test('cellValueChanged invalidates formulas that REF a non-formula column — downstream rows are not left stale', async () => {
            const api = gridsManager.createGrid('api-cell-edit-cross-row-non-formula-ref', {
                getRowId: (params) => params.data?.id,
                rowData: [
                    { id: 'a', plain: 5 },
                    { id: 'b', out: '=REF(COLUMN("plain"),ROW("a"))*2' },
                ],
                columnDefs: [{ field: 'plain' }, { field: 'out', allowFormula: true }],
            });
            await asyncSetTimeout(rowNumberRefreshBufferMs);

            await new GridRows(api, 'initial: b.out reads a.plain', gridRowsOpts).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:a row-number:"1" plain:5
                └── LEAF id:b row-number:"2" out:10
            `);

            const a = api.getRowNode('a')!;
            a.setDataValue('plain', 20);
            await asyncSetTimeout(rowNumberRefreshBufferMs);

            await new GridRows(api, 'after a.plain edit: b.out refreshed', gridRowsOpts).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:a row-number:"1" plain:20
                └── LEAF id:b row-number:"2" out:40
            `);
        });

        test('cellValueChanged does not double-refresh when valueService fires both body and pinned events', async () => {
            const getFormula = vi.fn(({ rowNode, column }) => {
                if (column.getColId() !== 'out') {
                    return undefined;
                }
                return `=${Number(rowNode.data?.plain ?? 0)}+2`;
            });

            const api = gridsManager.createGrid('api-cell-edit-no-double-refresh', {
                getRowId: (params) => params.data?.id,
                rowData: [{ id: 'r1', plain: 2, out: null }],
                columnDefs: [{ field: 'plain' }, { field: 'out', allowFormula: true }],
                enableRowPinning: true,
                isRowPinned: () => 'top',
                formulaDataSource: { getFormula, setFormula: vi.fn() },
            });
            await new GridColumns(
                api,
                `cellValueChanged does not double-refresh when valueService fires both body and p setup`
            ).checkColumns(`
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                ├── plain "Plain" width:200
                └── out "Out" width:200
            `);
            await new GridRows(
                api,
                `cellValueChanged does not double-refresh when valueService fires both body and p setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:r1 row-number:"1" plain:2 out:4
            `);
            await asyncSetTimeout(rowNumberRefreshBufferMs);

            // Clear the spy after initial render populates both caches.
            getFormula.mockClear();

            const r1 = api.getRowNode('r1')!;
            r1.setDataValue('plain', 10);
            await asyncSetTimeout(rowNumberRefreshBufferMs);

            // After the edit: cache for body and pinned each cleared once (by the first event),
            // then re-populated once each by the repaint. With the old always-bump handler the
            // second event would wipe + refresh again, doubling the getFormula calls.
            const outCalls = getFormula.mock.calls.filter(([p]) => p.column.getColId() === 'out');
            expect(outCalls.length).toBe(2);
            await new GridRows(
                api,
                `cellValueChanged does not double-refresh when valueService fires both body and p final state`
            ).check(`
                PINNED_TOP id:t-top-r1 row-number:"1" plain:10 out:12
                ROOT id:ROOT_NODE_ID
                └── LEAF id:r1 row-number:"1" plain:10 out:12
            `); // one for body, one for pinned sibling
        });

        test('refreshFormulas propagates through the pinned-sibling chain from either side', async () => {
            const store = new Map<string, string>([['r1:out', '=1+2']]);
            const getFormula = vi.fn(({ rowNode, column }) => {
                const bodyId = rowNode.id!.replace(/^t-top-/, '');
                return store.get(`${bodyId}:${column.getColId()}`);
            });

            const api = gridsManager.createGrid('api-refresh-pinned-sibling-chain', {
                getRowId: (params) => params.data?.id,
                rowData: [{ id: 'r1', out: null }],
                columnDefs: [{ field: 'out', allowFormula: true }],
                enableRowPinning: true,
                isRowPinned: () => 'top',
                formulaDataSource: { getFormula, setFormula: vi.fn() },
            });
            await asyncSetTimeout(rowNumberRefreshBufferMs);

            await new GridRows(api, 'initial: body and pinned both cached', gridRowsOpts).check(`
                PINNED_TOP id:t-top-r1 row-number:"1" out:3
                ROOT id:ROOT_NODE_ID
                └── LEAF id:r1 row-number:"1" out:3
            `);

            store.set('r1:out', '=100+1');
            const pinnedRow = api.getPinnedTopRow(0) as RowNode;
            expect(api.refreshFormulas(pinnedRow)).toBe(true);
            await asyncSetTimeout(rowNumberRefreshBufferMs);

            await new GridRows(api, 'after refresh via pinned node', gridRowsOpts).check(`
                PINNED_TOP id:t-top-r1 row-number:"1" out:101
                ROOT id:ROOT_NODE_ID
                └── LEAF id:r1 row-number:"1" out:101
            `);

            store.set('r1:out', '=999-1');
            expect(api.refreshFormulas('r1')).toBe(true);
            await asyncSetTimeout(rowNumberRefreshBufferMs);

            await new GridRows(api, 'after refresh via body id', gridRowsOpts).check(`
                PINNED_TOP id:t-top-r1 row-number:"1" out:998
                ROOT id:ROOT_NODE_ID
                └── LEAF id:r1 row-number:"1" out:998
            `);

            store.set('r1:out', '=42+0');
            expect(api.refreshFormulas(pinnedRow.id!)).toBe(true);
            await asyncSetTimeout(rowNumberRefreshBufferMs);

            await new GridRows(api, 'after refresh via pinned id string', gridRowsOpts).check(`
                PINNED_TOP id:t-top-r1 row-number:"1" out:42
                ROOT id:ROOT_NODE_ID
                └── LEAF id:r1 row-number:"1" out:42
            `);
        });
    });
});
