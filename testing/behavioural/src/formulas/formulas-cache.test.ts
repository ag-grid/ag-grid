import { vi } from 'vitest';

import type { FormulaFunctionParams, GridOptions, Module } from 'ag-grid-community';
import { ClientSideRowModelModule, TextEditorModule } from 'ag-grid-community';
import { FormulaModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, applyTransactionChecked, asyncSetTimeout } from '../test-utils';

describe('ag-grid formulas cache behaviour', () => {
    const rowNumberRefreshBufferMs = 25;
    const gridRowsOpts = { useFormatter: false } as const;

    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, FormulaModule, TextEditorModule] as Module[],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    function createSpy(name: string) {
        return vi
            .fn((params: FormulaFunctionParams) => {
                const [first] = Array.from(params.values);
                return first as number;
            })
            .mockName(name);
    }

    test('transitive invalidation: updating a root propagates through a chain', async () => {
        const spy = createSpy('TRACE');
        const rowData = [
            { id: 'root', value: 1 },
            { id: 'link-1', value: '=TRACE(REF(COLUMN("value"),ROW("root")))' },
            { id: 'link-2', value: '=TRACE(REF(COLUMN("value"),ROW("link-1")))' },
            { id: 'link-3', value: '=TRACE(REF(COLUMN("value"),ROW("link-2")))' },
        ];
        const gridOptions: GridOptions = {
            defaultColDef: { allowFormula: true },
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [{ field: 'value' }],
            formulaFuncs: { TRACE: { func: spy } },
        };
        const api = gridsManager.createGrid('formulas-cache-transitive', gridOptions);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'initial chain', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:root row-number:"1" value:1
            ├── LEAF id:link-1 row-number:"2" value:1
            ├── LEAF id:link-2 row-number:"3" value:1
            └── LEAF id:link-3 row-number:"4" value:1
        `);

        const initialCallCount = spy.mock.calls.length;
        expect(initialCallCount).toBeGreaterThanOrEqual(3);

        applyTransactionChecked(api, { update: [{ id: 'root', value: 99 }] });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'after root update', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:root row-number:"1" value:99
            ├── LEAF id:link-1 row-number:"2" value:99
            ├── LEAF id:link-2 row-number:"3" value:99
            └── LEAF id:link-3 row-number:"4" value:99
        `);

        expect(spy.mock.calls.length - initialCallCount).toBeGreaterThanOrEqual(3);
    });

    test('editing a cell formula invalidates that cell only', async () => {
        const rowData = [{ id: 'r1', a: 5, b: 7, out: '=REF(COLUMN("a"),ROW("r1"))+REF(COLUMN("b"),ROW("r1"))' }];
        const gridOptions: GridOptions = {
            defaultColDef: { allowFormula: true },
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'out' }],
        };
        const api = gridsManager.createGrid('formulas-cache-string-edit', gridOptions);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'initial formula', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" a:5 b:7 out:12
        `);

        applyTransactionChecked(api, {
            update: [{ id: 'r1', a: 5, b: 7, out: '=REF(COLUMN("a"),ROW("r1"))*REF(COLUMN("b"),ROW("r1"))' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'after formula edit', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" a:5 b:7 out:35
        `);
    });

    test('removing and re-adding a row with the same id returns a fresh value', async () => {
        const rowData = [
            { id: 'src', value: 10 },
            { id: 'dep', value: '=REF(COLUMN("value"),ROW("src"))*2' },
        ];
        const gridOptions: GridOptions = {
            defaultColDef: { allowFormula: true },
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [{ field: 'value' }],
        };
        const api = gridsManager.createGrid('formulas-cache-row-recreate', gridOptions);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'initial', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:src row-number:"1" value:10
            └── LEAF id:dep row-number:"2" value:20
        `);

        applyTransactionChecked(api, { remove: [{ id: 'src' }] });
        applyTransactionChecked(api, { add: [{ id: 'src', value: 50 }], addIndex: 0 });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'after recreate', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:src row-number:"1" value:50
            └── LEAF id:dep row-number:"2" value:100
        `);
    });

    test('formula recovers after its referenced column is removed then re-added', async () => {
        const rowData = [{ id: 'r1', a: 3, b: 4, out: '=REF(COLUMN("a"),ROW("r1"))+REF(COLUMN("b"),ROW("r1"))' }];
        const gridOptions: GridOptions = {
            defaultColDef: { allowFormula: true },
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'out' }],
        };
        const api = gridsManager.createGrid('formulas-cache-col-recreate', gridOptions);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'with b column', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" a:3 b:4 out:7
        `);

        api.updateGridOptions({ columnDefs: [{ field: 'a' }, { field: 'out' }] });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'without b column', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" a:3 out:"#REF!"
        `);

        api.updateGridOptions({ columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'out' }] });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'with b column again', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" a:3 b:4 out:7
        `);
    });

    test('custom function reading row.data directly still refreshes when data changes', async () => {
        // Granular invalidation must not skip cells that read row.data bypass-style instead of via REF().
        const directReader = vi
            .fn((params: FormulaFunctionParams) => {
                const data = params.row.data as { a?: number; b?: number } | undefined;
                return (data?.a ?? 0) + (data?.b ?? 0);
            })
            .mockName('DIRECTREAD');

        const rowData = [{ id: 'r1', a: 2, b: 3, out: '=DIRECTREAD()' }];
        const gridOptions: GridOptions = {
            defaultColDef: { allowFormula: true },
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'out' }],
            formulaFuncs: { DIRECTREAD: { func: directReader } },
        };
        const api = gridsManager.createGrid('formulas-cache-direct-read', gridOptions);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'initial', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" a:2 b:3 out:5
        `);

        applyTransactionChecked(api, { update: [{ id: 'r1', a: 10, b: 3, out: '=DIRECTREAD()' }] });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'after data change', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" a:10 b:3 out:13
        `);

        expect(directReader).toHaveBeenCalled();
    });

    test('errored cells recover when the failing dependency is fixed', async () => {
        const rowData = [
            { id: 'src', value: 0 },
            { id: 'dep', value: '=REF(COLUMN("value"),ROW("src"))/REF(COLUMN("value"),ROW("src"))' },
        ];
        const gridOptions: GridOptions = {
            defaultColDef: { allowFormula: true },
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [{ field: 'value' }],
        };
        const api = gridsManager.createGrid('formulas-cache-error-recovery', gridOptions);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'initial error', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:src row-number:"1" value:0
            └── LEAF id:dep row-number:"2" value:"#DIV/0!"
        `);

        applyTransactionChecked(api, { update: [{ id: 'src', value: 4 }] });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'after fix', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:src row-number:"1" value:4
            └── LEAF id:dep row-number:"2" value:1
        `);
    });

    test('introducing a cycle after successful caching is detected', async () => {
        const rowData = [
            { id: 'r1', value: 1 },
            { id: 'r2', value: '=REF(COLUMN("value"),ROW("r1"))' },
        ];
        const gridOptions: GridOptions = {
            defaultColDef: { allowFormula: true },
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [{ field: 'value' }],
        };
        const api = gridsManager.createGrid('formulas-cache-cycle', gridOptions);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'initial', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" value:1
            └── LEAF id:r2 row-number:"2" value:1
        `);

        applyTransactionChecked(api, {
            update: [{ id: 'r1', value: '=REF(COLUMN("value"),ROW("r2"))' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'after cycle introduced', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" value:"#CIRCREF!"
            └── LEAF id:r2 row-number:"2" value:"#CIRCREF!"
        `);
    });

    test('cell mutates between formula and plain value without caching a stale answer', async () => {
        const rowData = [
            { id: 'src', value: 10 },
            { id: 'target', value: '=REF(COLUMN("value"),ROW("src"))*3' },
        ];
        const api = gridsManager.createGrid('formulas-cache-formula-toggle', {
            defaultColDef: { allowFormula: true },
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [{ field: 'value' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'formula present', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:src row-number:"1" value:10
            └── LEAF id:target row-number:"2" value:30
        `);

        applyTransactionChecked(api, { update: [{ id: 'target', value: 7 }] });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'formula replaced with plain value', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:src row-number:"1" value:10
            └── LEAF id:target row-number:"2" value:7
        `);

        applyTransactionChecked(api, {
            update: [{ id: 'target', value: '=REF(COLUMN("value"),ROW("src"))+1' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'plain value replaced with formula', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:src row-number:"1" value:10
            └── LEAF id:target row-number:"2" value:11
        `);
    });

    test('errors propagate through a multi-level chain and all levels recover together', async () => {
        const rowData = [
            { id: 'src', value: 0 },
            { id: 'a', value: '=REF(COLUMN("value"),ROW("src"))/REF(COLUMN("value"),ROW("src"))' },
            { id: 'b', value: '=REF(COLUMN("value"),ROW("a"))+1' },
            { id: 'c', value: '=REF(COLUMN("value"),ROW("b"))*2' },
        ];
        const api = gridsManager.createGrid('formulas-cache-error-chain', {
            defaultColDef: { allowFormula: true },
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [{ field: 'value' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'initial chain errors', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:src row-number:"1" value:0
            ├── LEAF id:a row-number:"2" value:"#DIV/0!"
            ├── LEAF id:b row-number:"3" value:"#DIV/0!"
            └── LEAF id:c row-number:"4" value:"#DIV/0!"
        `);

        applyTransactionChecked(api, { update: [{ id: 'src', value: 5 }] });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'chain recovered', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:src row-number:"1" value:5
            ├── LEAF id:a row-number:"2" value:1
            ├── LEAF id:b row-number:"3" value:2
            └── LEAF id:c row-number:"4" value:4
        `);
    });

    test('batched updates to multiple dependency sources in one transaction all take effect', async () => {
        const rowData = [
            { id: 's1', value: 1 },
            { id: 's2', value: 2 },
            { id: 's3', value: 3 },
            { id: 'd1', value: '=REF(COLUMN("value"),ROW("s1"))*10' },
            { id: 'd2', value: '=REF(COLUMN("value"),ROW("s2"))*10' },
            { id: 'd3', value: '=REF(COLUMN("value"),ROW("s3"))*10' },
            {
                id: 'total',
                value: '=REF(COLUMN("value"),ROW("d1"))+REF(COLUMN("value"),ROW("d2"))+REF(COLUMN("value"),ROW("d3"))',
            },
        ];
        const api = gridsManager.createGrid('formulas-cache-batched', {
            defaultColDef: { allowFormula: true },
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [{ field: 'value' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'initial', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:s1 row-number:"1" value:1
            ├── LEAF id:s2 row-number:"2" value:2
            ├── LEAF id:s3 row-number:"3" value:3
            ├── LEAF id:d1 row-number:"4" value:10
            ├── LEAF id:d2 row-number:"5" value:20
            ├── LEAF id:d3 row-number:"6" value:30
            └── LEAF id:total row-number:"7" value:60
        `);

        applyTransactionChecked(api, {
            update: [
                { id: 's1', value: 4 },
                { id: 's2', value: 5 },
                { id: 's3', value: 6 },
            ],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'after batched update', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:s1 row-number:"1" value:4
            ├── LEAF id:s2 row-number:"2" value:5
            ├── LEAF id:s3 row-number:"3" value:6
            ├── LEAF id:d1 row-number:"4" value:40
            ├── LEAF id:d2 row-number:"5" value:50
            ├── LEAF id:d3 row-number:"6" value:60
            └── LEAF id:total row-number:"7" value:150
        `);
    });

    test('rapid consecutive updates never read a stale cached value', async () => {
        const api = gridsManager.createGrid('formulas-cache-rapid', {
            defaultColDef: { allowFormula: true },
            rowData: [
                { id: 'src', value: 0 },
                { id: 'dep', value: '=REF(COLUMN("value"),ROW("src"))+1' },
            ],
            getRowId: (params) => params.data?.id,
            columnDefs: [{ field: 'value' }],
        });
        await new GridColumns(api, `rapid consecutive updates never read a stale cached value setup`).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            └── value "Value" width:200
        `);
        await new GridRows(api, `rapid consecutive updates never read a stale cached value setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:src row-number:"1" value:0
            └── LEAF id:dep row-number:"2" value:1
        `);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        const depNode = api.getRowNode('dep')!;
        const values: unknown[] = [];

        for (const v of [10, 20, 30, 40, 50]) {
            applyTransactionChecked(api, { update: [{ id: 'src', value: v }] });
            values.push(api.getCellValue({ rowNode: depNode, colKey: 'value', useFormatter: false }));
        }

        expect(values).toEqual([11, 21, 31, 41, 51]);
        await new GridRows(api, `rapid consecutive updates never read a stale cached value final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:src row-number:"1" value:50
            └── LEAF id:dep row-number:"2" value:51
        `);
    });

    test('setting rowData to the same array reference yields the same values', async () => {
        const rowData = [
            { id: 'x', value: 11 },
            { id: 'y', value: '=REF(COLUMN("value"),ROW("x"))+100' },
        ];
        const api = gridsManager.createGrid('formulas-cache-same-identity', {
            defaultColDef: { allowFormula: true },
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [{ field: 'value' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'initial', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:x row-number:"1" value:11
            └── LEAF id:y row-number:"2" value:111
        `);

        api.setGridOption('rowData', rowData);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'after identity-preserving re-set', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:x row-number:"1" value:11
            └── LEAF id:y row-number:"2" value:111
        `);
    });

    test('appending rows re-evaluates formulas with previously out-of-bounds absolute row refs', async () => {
        const api = gridsManager.createGrid('formulas-cache-append-absolute-row', {
            defaultColDef: { allowFormula: true },
            rowData: [
                { id: 'r1', value: 10 },
                { id: 'dep', value: '=REF(COLUMN("A",true),ROW("3",true))' },
            ],
            getRowId: (params) => params.data?.id,
            columnDefs: [{ field: 'value' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'before append', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" value:10
            └── LEAF id:dep row-number:"2" value:"#REF!"
        `);

        applyTransactionChecked(api, { add: [{ id: 'r3', value: 77 }] });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'after append', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" value:10
            ├── LEAF id:dep row-number:"2" value:77
            └── LEAF id:r3 row-number:"3" value:77
        `);
    });
});
