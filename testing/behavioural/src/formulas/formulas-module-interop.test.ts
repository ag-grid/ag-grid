import { waitFor } from '@testing-library/dom';
import { _doOnce } from 'ag-stack';
import { ALL_SEVERITIES, GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from 'ag-test-utils';
import type { MockInstance } from 'vitest';
import { vi } from 'vitest';

import type { GetDetailRowDataParams, GridOptions, Module } from 'ag-grid-community';
import { ClientSideRowModelModule, enableDevValidations, getGridElement } from 'ag-grid-community';
import {
    CalculatedColumnsModule,
    FormulaModule,
    MasterDetailModule,
    PivotModule,
    RowGroupingModule,
    TreeDataModule,
} from 'ag-grid-enterprise';

describe('ag-grid formulas module interop', () => {
    const rowNumberRefreshBufferMs = 25;

    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            FormulaModule,
            CalculatedColumnsModule,
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

    function expectNotBlockedWith(service: string) {
        const encoded = encodeURIComponent(service);
        const hit = warnSpy!.mock.calls.some((args) =>
            args.some((arg) => typeof arg === 'string' && (arg.includes(service) || arg.includes(encoded)))
        );
        expect(hit).toBe(false);
    }

    const rowData = [
        { id: 'a', group: 'g1', cat: 'x', parent: null, value: 1 },
        { id: 'b', group: 'g1', cat: 'y', parent: null, value: '=REF(COLUMN("value"),ROW("a"))*2' },
    ];

    test('masterDetail blocks formulas', async () => {
        // Asserts the blocker warning (#295) fires; suppress only that id so any other still throws.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [295] });
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

    test('toggling masterDetail at runtime switches formulas off and on, with the same columns and events each way', async () => {
        // Asserts the blocker warning (#295) fires; suppress only that id so any other still throws.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [295] });
        const api = gridsManager.createGrid('formulas-interop-master-toggle', {
            masterDetail: false,
            detailCellRendererParams: {
                detailGridOptions: { columnDefs: [{ field: 'a' }] },
                getDetailRowData: (params: GetDetailRowDataParams) => params.successCallback([]),
            },
            columnDefs: [{ field: 'a', allowFormula: true }, { field: 'b' }],
            rowData: [
                { a: '=1+2', b: 1 },
                { a: 5, b: 2 },
            ],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        const events: string[] = [];
        api.addEventListener('gridColumnsChanged', () => events.push('gridColumnsChanged'));
        api.addEventListener('virtualColumnsChanged', () => events.push('virtualColumnsChanged'));
        api.addEventListener('displayedColumnsChanged', () => events.push('displayedColumnsChanged'));
        api.addEventListener('modelUpdated', () => events.push('modelUpdated'));

        const blockerWarnings = () =>
            warnSpy!.mock.calls.filter((args) =>
                args.some(
                    (arg) =>
                        typeof arg === 'string' &&
                        (arg.includes('Master Detail') || arg.includes(encodeURIComponent('Master Detail')))
                )
            ).length;

        const read = () => ({
            value: api.getCellValue({ rowNode: api.getDisplayedRowAtIndex(0)!, colKey: 'a' }),
            text: getGridElement(api)!.querySelector('.ag-row[row-index="0"] [col-id="a"]')!.textContent,
            columns: api.getAllDisplayedColumns().map((col) => col.getColId()),
            blockerWarnings: blockerWarnings(),
        });

        const toggle = async (masterDetail: boolean) => {
            events.length = 0;
            api.setGridOption('masterDetail', masterDetail);
            await waitFor(() => expect(events.length).toBeGreaterThanOrEqual(4), { timeout: 500 });
            await asyncSetTimeout(0);
            return { ...read(), events: [...events] };
        };

        const withRowNumbers = ['ag-Grid-RowNumbersColumn', 'a', 'b'];
        const sameEvents = ['gridColumnsChanged', 'modelUpdated', 'virtualColumnsChanged', 'displayedColumnsChanged'];

        expect(read()).toEqual({ value: 3, text: '3', columns: withRowNumbers, blockerWarnings: 0 });

        expect(await toggle(true)).toEqual({
            value: '=1+2',
            text: '=1+2',
            columns: ['a', 'b'],
            blockerWarnings: 1,
            events: sameEvents,
        });

        expect(await toggle(false)).toEqual({
            value: 3,
            text: '3',
            columns: withRowNumbers,
            blockerWarnings: 1,
            events: sameEvents,
        });
    });

    test('masterDetail supports calculated columns', async () => {
        const api = gridsManager.createGrid('calculated-columns-interop-master', {
            calculatedColumns: true,
            masterDetail: true,
            detailCellRendererParams: {
                detailGridOptions: { columnDefs: [{ field: 'value' }] },
                getDetailRowData: (params: any) => params.successCallback([]),
            },
            rowData: [{ id: 'a', value: 2 }],
            getRowId: (params) => params.data.id,
            columnDefs: [{ field: 'value' }, { colId: 'doubled', calculatedExpression: '[value] * 2' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        const row = api.getRowNode('a')!;
        expect(api.getCellValue({ rowNode: row, colKey: 'doubled' })).toBe(4);
        expectNotBlockedWith('Master Detail');
    });

    test('treeData blocks formulas', async () => {
        // Asserts the blocker warning (#295) fires; suppress only that id so any other still throws.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [295] });
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
        // Asserts the blocker warning (#295); #16 is the expected eval failure of the `=REF(...)` row
        // data under enableCellExpressions (see the console.error stub above). Any other id still throws.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [295, 16] });
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
        // Asserts the blocker warning (#295) fires; suppress only that id so any other still throws.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [295] });
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
        // Asserts the blocker warning (#295) fires; suppress only that id so any other still throws.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [295] });
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
        // Asserts the blocker warning (#295) fires; suppress only that id so any other still throws.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [295] });
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

    test('a column state turning value aggregation on turns formulas off', async () => {
        // Asserts the blocker warning (#295) fires; suppress only that id so any other still throws.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [295] });
        const api = gridsManager.createGrid('formulas-interop-agg-state', {
            columnDefs: [{ field: 'a', allowFormula: true }, { field: 'b' }],
            rowData: [{ a: '=1+2', b: 1 }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        const read = () => ({
            bAggFunc: api.getColumn('b')!.getAggFunc() ?? null,
            value: api.getCellValue({ rowNode: api.getDisplayedRowAtIndex(0)!, colKey: 'a' }),
            text: getGridElement(api)!.querySelector('.ag-row[row-index="0"] [col-id="a"]')!.textContent,
            valueAggregationWarned: warnSpy!.mock.calls.some((args) =>
                args.some(
                    (arg) =>
                        typeof arg === 'string' &&
                        (arg.includes('Value Aggregation') || arg.includes(encodeURIComponent('Value Aggregation')))
                )
            ),
        });

        // premise: formulas are active before the column state is applied
        expect(read()).toEqual({ bAggFunc: null, value: 3, text: '3', valueAggregationWarned: false });

        api.applyColumnState({ state: [{ colId: 'b', aggFunc: 'sum' }] });
        await waitFor(() =>
            expect(read()).toEqual({ bAggFunc: 'sum', value: '=1+2', text: '=1+2', valueAggregationWarned: true })
        );
    });

    test('a column state turning value aggregation off again turns formulas back on', async () => {
        // Asserts the blocker warning (#295) fires; suppress only that id so any other still throws.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [295] });
        const api = gridsManager.createGrid('formulas-interop-agg-state-off', {
            columnDefs: [{ field: 'a', allowFormula: true }, { field: 'b' }],
            rowData: [{ a: '=1+2', b: 1 }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        const read = () => ({
            valueColumns: api.getValueColumns().map((col) => col.getColId()),
            value: api.getCellValue({ rowNode: api.getDisplayedRowAtIndex(0)!, colKey: 'a' }),
            text: getGridElement(api)!.querySelector('.ag-row[row-index="0"] [col-id="a"]')!.textContent,
        });

        api.applyColumnState({ state: [{ colId: 'b', aggFunc: 'sum' }] });
        await waitFor(() => expect(read()).toEqual({ valueColumns: ['b'], value: '=1+2', text: '=1+2' }), {
            timeout: 500,
        });

        api.applyColumnState({ state: [{ colId: 'b', aggFunc: null }] });
        await waitFor(() => expect(read()).toEqual({ valueColumns: [], value: 3, text: '3' }), { timeout: 500 });
    });

    test('setValueColumns([]) turning value aggregation off turns formulas back on, after a column state or addValueColumns turned it on', async () => {
        // Asserts the blocker warning (#295) fires; suppress only that id so any other still throws.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [295] });
        const api = gridsManager.createGrid('formulas-interop-agg-set-value-cols', {
            columnDefs: [{ field: 'a', allowFormula: true }, { field: 'b' }],
            rowData: [{ a: '=1+2', b: 1 }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        const read = () => ({
            valueColumns: api.getValueColumns().map((col) => col.getColId()),
            value: api.getCellValue({ rowNode: api.getDisplayedRowAtIndex(0)!, colKey: 'a' }),
            text: getGridElement(api)!.querySelector('.ag-row[row-index="0"] [col-id="a"]')!.textContent,
        });
        const formulasOff = { valueColumns: ['b'], value: '=1+2', text: '=1+2' };
        const formulasOn = { valueColumns: [], value: 3, text: '3' };

        api.applyColumnState({ state: [{ colId: 'b', aggFunc: 'sum' }] });
        await waitFor(() => expect(read()).toEqual(formulasOff), { timeout: 500 });
        api.setValueColumns([]);
        await waitFor(
            () => expect({ after: 'column state', ...read() }).toEqual({ after: 'column state', ...formulasOn }),
            {
                timeout: 500,
            }
        );

        api.addValueColumns(['b']);
        await waitFor(() => expect(read()).toEqual(formulasOff), { timeout: 500 });
        api.setValueColumns([]);
        await waitFor(
            () => expect({ after: 'addValueColumns', ...read() }).toEqual({ after: 'addValueColumns', ...formulasOn }),
            { timeout: 500 }
        );
    });

    test('a column with enableValue keeps formulas off while no value aggregation is in use', async () => {
        // A blocker warning (#295) may fire; suppress only that id so any other still throws.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [295] });
        const api = gridsManager.createGrid('formulas-interop-enable-value', {
            columnDefs: [
                { field: 'a', allowFormula: true },
                { field: 'b', enableValue: true },
            ],
            rowData: [{ a: '=1+2', b: 1 }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        expect({
            valueColumns: api.getValueColumns().map((col) => col.getColId()),
            value: api.getCellValue({ rowNode: api.getDisplayedRowAtIndex(0)!, colKey: 'a' }),
            text: getGridElement(api)!.querySelector('.ag-row[row-index="0"] [col-id="a"]')!.textContent,
        }).toEqual({ valueColumns: [], value: '=1+2', text: '=1+2' });
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
        // Asserts the blocker warning (#295) fires; suppress only that id so any other still throws.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [295] });
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
