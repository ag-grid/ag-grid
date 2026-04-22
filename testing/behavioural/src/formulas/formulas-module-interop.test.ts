import type { MockInstance } from 'vitest';
import { vi } from 'vitest';

import type { GridOptions, Module } from 'ag-grid-community';
import { ClientSideRowModelModule, _doOnce } from 'ag-grid-community';
import { FormulaModule, MasterDetailModule, PivotModule, RowGroupingModule, TreeDataModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

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
});
