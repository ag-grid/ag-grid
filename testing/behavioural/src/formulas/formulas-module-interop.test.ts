import { _doOnce } from 'ag-stack';
import type { MockInstance } from 'vitest';
import { vi } from 'vitest';

import type { GridOptions, Module } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { FormulaModule, MasterDetailModule, PivotModule, RowGroupingModule, TreeDataModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('ag-grid formulas module interop', () => {
    const rowNumberRefreshBufferMs = 25;

    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            FormulaModule,
            MasterDetailModule,
            TreeDataModule,
            RowGroupingModule,
            PivotModule,
        ] as Module[],
    });

    let warnSpy: MockInstance | undefined;
    let errorSpy: MockInstance | undefined;

    beforeEach(() => {
        gridsManager.reset();
        // _warn de-dupes via _doOnce across the whole process; clear per test so warnings fire again.
        (_doOnce as unknown as { _set: Set<string> })._set.clear();
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        // enableCellExpressions evaluates `=REF(...)` as JS and logs to console.error; suppress it.
        errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        gridsManager.reset();
        warnSpy?.mockRestore();
        warnSpy = undefined;
        errorSpy?.mockRestore();
        errorSpy = undefined;
    });

    function expectBlockedWith(service: string) {
        const encoded = encodeURIComponent(service);
        const hit = warnSpy!.mock.calls.some((args) =>
            args.some((arg) => typeof arg === 'string' && (arg.includes(service) || arg.includes(encoded)))
        );
        expect(hit).toBe(true);
    }

    const rowData = [
        { id: 'a', group: 'g1', cat: 'x', parent: null, value: 1 },
        { id: 'b', group: 'g1', cat: 'y', parent: null, value: '=REF(COLUMN("value"),ROW("a"))*2' },
    ];

    test('masterDetail blocks formulas', async () => {
        const options: GridOptions = {
            defaultColDef: { allowFormula: true },
            masterDetail: true,
            detailCellRendererParams: {
                detailGridOptions: { columnDefs: [{ field: 'value' }] },
                getDetailRowData: (params: any) => params.successCallback([]),
            },
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [{ field: 'value' }],
        };
        gridsManager.createGrid('formulas-interop-master', options);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        expectBlockedWith('Master Detail');
    });

    test('treeData blocks formulas', async () => {
        const options: GridOptions = {
            defaultColDef: { allowFormula: true },
            treeData: true,
            treeDataParentIdField: 'parent',
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [{ field: 'value' }],
            autoGroupColumnDef: { headerName: 'Name' },
        };
        gridsManager.createGrid('formulas-interop-tree', options);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        expectBlockedWith('Tree Data');
    });

    test('enableCellExpressions blocks formulas', async () => {
        const options: GridOptions = {
            defaultColDef: { allowFormula: true },
            enableCellExpressions: true,
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [{ field: 'value' }],
        };
        gridsManager.createGrid('formulas-interop-cellexpr', options);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        expectBlockedWith('Cell Expressions');
    });

    test('column pivoting blocks formulas', async () => {
        const options: GridOptions = {
            defaultColDef: { allowFormula: true },
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [{ field: 'cat', pivot: true }, { field: 'value' }],
            pivotMode: true,
        };
        gridsManager.createGrid('formulas-interop-pivot', options);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        expectBlockedWith('Column Pivoting');
        const warningText = warnSpy!.mock.calls.flat().join('\n');
        expect(warningText).toContain('`colDef.allowFormula` is not supported with Column Pivoting');
        expect(warningText).not.toContain('Calculated Columns');
    });

    test('row grouping blocks formulas', async () => {
        const options: GridOptions = {
            defaultColDef: { allowFormula: true },
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [{ field: 'group', rowGroup: true }, { field: 'value' }],
        };
        gridsManager.createGrid('formulas-interop-rowgroup', options);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        expectBlockedWith('Row Groups');
    });

    test('value aggregation blocks formulas', async () => {
        const options: GridOptions = {
            defaultColDef: { allowFormula: true },
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [{ field: 'value', aggFunc: 'sum' }],
        };
        gridsManager.createGrid('formulas-interop-agg', options);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        expectBlockedWith('Value Aggregation');
    });

    test('setGridOption columnDefs adds an allowFormula column → formulas activate', async () => {
        const api = gridsManager.createGrid('formulas-interop-defs-add', {
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [{ field: 'value' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);
        // No formula col yet → formula is inactive; raw '=' string is shown as-is.
        await new GridRows(api, 'formulas inactive').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:a value:1
            └── LEAF id:b value:"Invalid Number"
        `);
        expect(api.getCellValue({ rowNode: api.getRowNode('b')!, colKey: 'value' })).toBe(
            '=REF(COLUMN("value"),ROW("a"))*2'
        );

        api.setGridOption('columnDefs', [{ field: 'value', allowFormula: true }]);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        // Now formula is active: row b's value resolves via the formula.
        await new GridRows(api, 'formulas active').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:a row-number:"1" value:1
            └── LEAF id:b row-number:"2" value:2
        `);
        expect(api.getCellValue({ rowNode: api.getRowNode('b')!, colKey: 'value' })).toBe(2);
    });

    test('setGridOption columnDefs drops the only allowFormula column → formulas deactivate', async () => {
        const api = gridsManager.createGrid('formulas-interop-defs-drop', {
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [{ field: 'value', allowFormula: true }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);
        await new GridRows(api, 'formulas active before drop').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:a row-number:"1" value:1
            └── LEAF id:b row-number:"2" value:2
        `);
        expect(api.getCellValue({ rowNode: api.getRowNode('b')!, colKey: 'value' })).toBe(2);

        api.setGridOption('columnDefs', [{ field: 'value' }]);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        // Formula now inactive → raw '=' string is returned, not the computed value.
        await new GridRows(api, 'formulas inactive after drop').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:a value:1
            └── LEAF id:b value:"Invalid Number"
        `);
        expect(api.getCellValue({ rowNode: api.getRowNode('b')!, colKey: 'value' })).toBe(
            '=REF(COLUMN("value"),ROW("a"))*2'
        );
    });

    test('setGridOption columnDefs introduces a blocker column → formulas deactivate with warning', async () => {
        const api = gridsManager.createGrid('formulas-interop-defs-blocker', {
            defaultColDef: { allowFormula: true },
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [{ field: 'value' }],
        });
        await new GridColumns(
            api,
            `setGridOption columnDefs introduces a blocker column → formulas deactivate with  setup`
        ).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            └── value "Value" width:200
        `);
        await new GridRows(
            api,
            `setGridOption columnDefs introduces a blocker column → formulas deactivate with  setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:a row-number:"1" value:1
            └── LEAF id:b row-number:"2" value:2
        `);
        await asyncSetTimeout(rowNumberRefreshBufferMs);
        expect(api.getCellValue({ rowNode: api.getRowNode('b')!, colKey: 'value' })).toBe(2);

        // Adding an aggregation col mid-flight must re-evaluate active and disable formulas.
        api.setGridOption('columnDefs', [{ field: 'group', rowGroup: true }, { field: 'value' }]);
        await new GridColumns(
            api,
            `setGridOption columnDefs introduces a blocker column → formulas deactivate with  after setGridOption columnDefs`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── group "Group" width:200 rowGroup
            └── value "Value" width:200
        `);
        await new GridRows(
            api,
            `setGridOption columnDefs introduces a blocker column → formulas deactivate with  after setGridOption columnDefs`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP collapsed id:row-group-group-g1 ag-Grid-AutoColumn:"g1"
            · ├── LEAF hidden id:a group:"g1" value:1
            · └── LEAF hidden id:b group:"g1" value:"Invalid Number"
        `);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        expectBlockedWith('Row Groups');
    });
});
