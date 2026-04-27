import { getByTestId } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import {
    ClientSideRowModelModule,
    NumberEditorModule,
    TextEditorModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import { BatchEditModule, FormulaModule, PivotModule, RowGroupingModule, TreeDataModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout, waitForInput } from '../test-utils';

/** Tests for RowNode.getDataValue() method (AG-16600) */
describe('RowNode.getDataValue', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            TextEditorModule,
            NumberEditorModule,
            ClientSideRowModelModule,
            RowGroupingModule,
            TreeDataModule,
            BatchEditModule,
            FormulaModule,
            PivotModule,
        ],
    });

    beforeAll(() => setupAgTestIds());

    afterEach(() => {
        gridsManager.reset();
    });

    describe('basic usage', () => {
        test('getDataValue returns cell value for simple data', async () => {
            const api = await gridsManager.createGridAndWait('basic', {
                columnDefs: [{ field: 'name' }, { field: 'value' }],
                rowData: [
                    { id: '1', name: 'Alice', value: 100 },
                    { id: '2', name: 'Bob', value: 200 },
                ],
                getRowId: (params) => params.data.id,
            });

            const rowNode1 = api.getRowNode('1')!;
            const rowNode2 = api.getRowNode('2')!;

            expect(rowNode1.getDataValue('name')).toBe('Alice');
            expect(rowNode1.getDataValue('value')).toBe(100);
            expect(rowNode2.getDataValue('name')).toBe('Bob');
            expect(rowNode2.getDataValue('value')).toBe(200);
        });

        test('getDataValue returns undefined for non-existent column', async () => {
            const api = await gridsManager.createGridAndWait('nonexistent-col', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ id: '1', name: 'Alice' }],
                getRowId: (params) => params.data.id,
            });

            const rowNode = api.getRowNode('1')!;
            expect(rowNode.getDataValue('nonexistent')).toBeUndefined();
        });

        test('getDataValue returns undefined for nullish colKey', async () => {
            // Defensive call sites pass `colKey` from configuration that may be null/undefined.
            // The implementation relies on `colModel.getColOrColDefCol`'s internal `key == null`
            // short-circuit rather than re-checking — this test pins that contract so any future
            // change to the lookup surface fails loudly here instead of in a runtime error path.
            const api = await gridsManager.createGridAndWait('nullish-colkey', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ id: '1', name: 'Alice' }],
                getRowId: (params) => params.data.id,
            });

            const rowNode = api.getRowNode('1')!;
            expect(rowNode.getDataValue(null as any)).toBeUndefined();
            expect(rowNode.getDataValue(undefined as any)).toBeUndefined();
            // Same for non-default `from` modes — the lookup happens before the from-branching.
            expect(rowNode.getDataValue(null as any, 'edit')).toBeUndefined();
            expect(rowNode.getDataValue(null as any, 'batch')).toBeUndefined();
            expect(rowNode.getDataValue(null as any, 'value')).toBeUndefined();
            expect(rowNode.getDataValue(null as any, 'data-raw')).toBeUndefined();
        });

        test('getDataValue returns null for null cell value', async () => {
            const api = await gridsManager.createGridAndWait('null-value', {
                columnDefs: [{ field: 'name' }, { field: 'value' }],
                rowData: [{ id: '1', name: 'Alice', value: null }],
                getRowId: (params) => params.data.id,
            });

            const rowNode = api.getRowNode('1')!;
            expect(rowNode.getDataValue('value')).toBeNull();
        });

        test('getDataValue returns undefined for undefined cell value', async () => {
            const api = await gridsManager.createGridAndWait('undefined-value', {
                columnDefs: [{ field: 'name' }, { field: 'value' }],
                rowData: [{ id: '1', name: 'Alice' }], // value not set
                getRowId: (params) => params.data.id,
            });

            const rowNode = api.getRowNode('1')!;
            expect(rowNode.getDataValue('value')).toBeUndefined();
        });

        test('getDataValue uses valueGetter when defined', async () => {
            const api = await gridsManager.createGridAndWait('value-getter', {
                columnDefs: [
                    { field: 'firstName' },
                    { field: 'lastName' },
                    {
                        colId: 'fullName',
                        valueGetter: (params) => `${params.data.firstName} ${params.data.lastName}`,
                    },
                ],
                rowData: [{ id: '1', firstName: 'Alice', lastName: 'Smith' }],
                getRowId: (params) => params.data.id,
            });

            const rowNode = api.getRowNode('1')!;
            expect(rowNode.getDataValue('fullName')).toBe('Alice Smith');
        });

        test('getDataValue is symmetric with setDataValue', async () => {
            const api = await gridsManager.createGridAndWait('symmetric', {
                columnDefs: [
                    { field: 'name', editable: true },
                    { field: 'value', editable: true },
                ],
                rowData: [{ id: '1', name: 'Alice', value: 100 }],
                getRowId: (params) => params.data.id,
            });

            const rowNode = api.getRowNode('1')!;

            // Initial value
            expect(rowNode.getDataValue('value')).toBe(100);

            // Set new value
            rowNode.setDataValue('value', 200);

            // Get updated value
            expect(rowNode.getDataValue('value')).toBe(200);
            expect(rowNode.data.value).toBe(200);
        });

        test('getDataValue matches api.getCellValue', async () => {
            const api = await gridsManager.createGridAndWait('matches-api', {
                columnDefs: [{ field: 'name' }, { field: 'value' }],
                rowData: [{ id: '1', name: 'Alice', value: 100 }],
                getRowId: (params) => params.data.id,
            });

            const rowNode = api.getRowNode('1')!;

            expect(rowNode.getDataValue('name')).toBe(api.getCellValue({ rowNode, colKey: 'name' }));
            expect(rowNode.getDataValue('value')).toBe(api.getCellValue({ rowNode, colKey: 'value' }));
        });
    });

    describe('batch editing integration', () => {
        test('getDataValue returns committed data during batch edit', async () => {
            const api = await gridsManager.createGridAndWait('batch-from', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            api.startBatchEdit();

            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);
            const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));

            await userEvent.dblClick(cellA);
            const editor = await waitForInput(gridDiv, cellA, { popup: false });
            await userEvent.clear(editor);
            await userEvent.type(editor, 'typing');
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            // getDataValue always returns committed data, ignoring pending edits
            expect(rowNode.getDataValue('a')).toBe('initial');

            // Press Enter to close editor and create pending value
            await userEvent.keyboard('{Enter}');
            await asyncSetTimeout(1);

            // Still returns committed data (not pending batch value)
            expect(rowNode.data.a).toBe('initial');
            expect(rowNode.getDataValue('a')).toBe('initial');

            api.cancelBatchEdit();
            await asyncSetTimeout(1);

            expect(rowNode.getDataValue('a')).toBe('initial');
        });

        test('getDataValue reflects committed batch edit', async () => {
            const api = await gridsManager.createGridAndWait('batch-commit', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            api.startBatchEdit();

            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);
            const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));

            await userEvent.dblClick(cellA);
            const editor = await waitForInput(gridDiv, cellA, { popup: false });
            await userEvent.clear(editor);
            await userEvent.type(editor, 'committed{Enter}');
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;

            // Before commit, getDataValue returns original data
            expect(rowNode.getDataValue('a')).toBe('initial');

            api.commitBatchEdit();
            await asyncSetTimeout(1);

            // After commit, getDataValue returns committed value
            expect(rowNode.getDataValue('a')).toBe('committed');
            expect(rowNode.data.a).toBe('committed');
        });
    });

    describe('grouping and aggregation', () => {
        test('getDataValue returns aggregated value on group rows', async () => {
            const api = await gridsManager.createGridAndWait('group-agg', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'value', aggFunc: 'sum' },
                ],
                rowData: [
                    { id: '1', country: 'Ireland', value: 100 },
                    { id: '2', country: 'Ireland', value: 200 },
                    { id: '3', country: 'UK', value: 300 },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: 1,
            });

            await asyncSetTimeout(1);

            // Get group node for Ireland
            let irelandGroup: ReturnType<typeof api.getRowNode>;
            api.forEachNode((node) => {
                if (node.group && node.key === 'Ireland') {
                    irelandGroup = node;
                }
            });

            expect(irelandGroup).toBeDefined();
            expect(irelandGroup!.getDataValue('value')).toBe(300); // 100 + 200

            // Leaf nodes return their own value
            const leafNode = api.getRowNode('1')!;
            expect(leafNode.getDataValue('value')).toBe(100);
        });

        test('getDataValue on group row matches getCellValue', async () => {
            const api = await gridsManager.createGridAndWait('group-match', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'value', aggFunc: 'sum' },
                ],
                rowData: [
                    { id: '1', country: 'Ireland', value: 100 },
                    { id: '2', country: 'Ireland', value: 200 },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: 1,
            });

            await asyncSetTimeout(1);

            let irelandGroup: ReturnType<typeof api.getRowNode>;
            api.forEachNode((node) => {
                if (node.group && node.key === 'Ireland') {
                    irelandGroup = node;
                }
            });

            expect(irelandGroup!.getDataValue('value')).toBe(
                api.getCellValue({ rowNode: irelandGroup!, colKey: 'value' })
            );
        });

        test('getDataValue returns group key from auto-group column', async () => {
            const api = await gridsManager.createGridAndWait('group-key', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'value', aggFunc: 'sum' },
                ],
                rowData: [
                    { id: '1', country: 'Ireland', value: 100 },
                    { id: '2', country: 'Ireland', value: 200 },
                    { id: '3', country: 'UK', value: 300 },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: 1,
            });

            await asyncSetTimeout(1);

            // Get auto-group column
            const autoGroupCol = api.getColumn('ag-Grid-AutoColumn')!;
            expect(autoGroupCol).toBeDefined();

            // Find group nodes
            let irelandGroup: ReturnType<typeof api.getRowNode>;
            let ukGroup: ReturnType<typeof api.getRowNode>;
            api.forEachNode((node) => {
                if (node.group && node.key === 'Ireland') {
                    irelandGroup = node;
                } else if (node.group && node.key === 'UK') {
                    ukGroup = node;
                }
            });

            // Group key should be returned from auto-group column
            expect(irelandGroup!.getDataValue(autoGroupCol)).toBe('Ireland');
            expect(ukGroup!.getDataValue(autoGroupCol)).toBe('UK');

            // Verify matches getCellValue
            expect(irelandGroup!.getDataValue(autoGroupCol)).toBe(
                api.getCellValue({ rowNode: irelandGroup!, colKey: autoGroupCol })
            );
        });
    });

    describe('tree data', () => {
        test('getDataValue works with tree data nodes', async () => {
            const api = await gridsManager.createGridAndWait('tree-basic', {
                columnDefs: [{ field: 'name' }, { field: 'value', aggFunc: 'sum' }],
                treeData: true,
                treeDataChildrenField: 'children',
                rowData: [
                    {
                        id: '1',
                        name: 'Parent',
                        value: 10,
                        children: [
                            { id: '1-1', name: 'Child 1', value: 20 },
                            { id: '1-2', name: 'Child 2', value: 30 },
                        ],
                    },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: -1,
            });

            await asyncSetTimeout(1);

            const parentNode = api.getRowNode('1')!;
            const child1Node = api.getRowNode('1-1')!;

            // Parent node with aggregation
            expect(parentNode.getDataValue('name')).toBe('Parent');
            expect(parentNode.getDataValue('value')).toBe(50); // 20 + 30 children aggregated (parent's own 10 not included with includeParent false by default)

            // Child node
            expect(child1Node.getDataValue('name')).toBe('Child 1');
            expect(child1Node.getDataValue('value')).toBe(20);
        });
    });

    describe('with setDataValue', () => {
        test('getDataValue reflects changes from setDataValue immediately', async () => {
            const api = await gridsManager.createGridAndWait('set-get', {
                columnDefs: [{ field: 'value', editable: true }],
                rowData: [{ id: '1', value: 100 }],
                getRowId: (params) => params.data.id,
            });

            const rowNode = api.getRowNode('1')!;

            expect(rowNode.getDataValue('value')).toBe(100);

            rowNode.setDataValue('value', 200);

            expect(rowNode.getDataValue('value')).toBe(200);
            expect(api.getCellValue({ rowNode, colKey: 'value' })).toBe(200);
        });

        test('getDataValue and setDataValue work together for computed values', async () => {
            const api = await gridsManager.createGridAndWait('computed', {
                columnDefs: [
                    { field: 'price', editable: true },
                    { field: 'quantity', editable: true },
                    {
                        colId: 'total',
                        valueGetter: (params) => params.data.price * params.data.quantity,
                    },
                ],
                rowData: [{ id: '1', price: 10, quantity: 5 }],
                getRowId: (params) => params.data.id,
            });

            const rowNode = api.getRowNode('1')!;

            expect(rowNode.getDataValue('total')).toBe(50); // 10 * 5

            rowNode.setDataValue('price', 20);

            expect(rowNode.getDataValue('total')).toBe(100); // 20 * 5
        });
    });

    describe('column lookup', () => {
        test('getDataValue works with column id string', async () => {
            const api = await gridsManager.createGridAndWait('col-id', {
                columnDefs: [{ colId: 'myCol', field: 'value' }],
                rowData: [{ id: '1', value: 100 }],
                getRowId: (params) => params.data.id,
            });

            const rowNode = api.getRowNode('1')!;
            expect(rowNode.getDataValue('myCol')).toBe(100);
        });

        test('getDataValue works with column object', async () => {
            const api = await gridsManager.createGridAndWait('col-object', {
                columnDefs: [{ field: 'value' }],
                rowData: [{ id: '1', value: 100 }],
                getRowId: (params) => params.data.id,
            });

            const rowNode = api.getRowNode('1')!;
            const column = api.getColumn('value')!;

            expect(rowNode.getDataValue(column)).toBe(100);
        });
    });

    describe('formulas', () => {
        const rowNumberRefreshBufferMs = 25;

        test('getDataValue returns resolved formula value by default', async () => {
            const api = await gridsManager.createGridAndWait('formula-resolved', {
                defaultColDef: { allowFormula: true },
                rowNumbers: true,
                columnDefs: [{ field: 'value' }],
                rowData: [
                    { id: 'raw', value: 10 },
                    { id: 'constant', value: '=3.14' },
                    { id: 'sum', value: '=REF(COLUMN("value"),ROW("raw"))+5' },
                ],
                getRowId: (params) => params.data.id,
            });

            await asyncSetTimeout(rowNumberRefreshBufferMs);

            // Raw value
            expect(api.getRowNode('raw')!.getDataValue('value')).toBe(10);

            // Constant formula - should return resolved value
            expect(api.getRowNode('constant')!.getDataValue('value')).toBe(3.14);

            // Reference formula - should return resolved value (10 + 5 = 15)
            expect(api.getRowNode('sum')!.getDataValue('value')).toBe(15);
        });

        test('getDataValue with formulas matches getCellValue', async () => {
            const api = await gridsManager.createGridAndWait('formula-match', {
                defaultColDef: { allowFormula: true },
                rowNumbers: true,
                columnDefs: [{ field: 'value' }],
                rowData: [
                    { id: 'a', value: 20 },
                    { id: 'formula', value: '=REF(COLUMN("value"),ROW("a"))*2' },
                ],
                getRowId: (params) => params.data.id,
            });

            await asyncSetTimeout(rowNumberRefreshBufferMs);

            const formulaNode = api.getRowNode('formula')!;

            // getDataValue should match getCellValue
            expect(formulaNode.getDataValue('value')).toBe(api.getCellValue({ rowNode: formulaNode, colKey: 'value' }));
            expect(formulaNode.getDataValue('value')).toBe(40); // 20 * 2
        });

        test('getDataValue returns resolved formula with cell references', async () => {
            const api = await gridsManager.createGridAndWait('formula-ref', {
                defaultColDef: { allowFormula: true },
                rowNumbers: true,
                columnDefs: [{ field: 'A' }, { field: 'B' }, { field: 'result' }],
                rowData: [
                    { id: 'calc', A: 10, B: 5, result: '=REF(COLUMN("A"),ROW("calc"))+REF(COLUMN("B"),ROW("calc"))' },
                ],
                getRowId: (params) => params.data.id,
            });

            await asyncSetTimeout(rowNumberRefreshBufferMs);

            const calcNode = api.getRowNode('calc')!;
            expect(calcNode.getDataValue('result')).toBe(15); // 10 + 5
        });

        test('getDataValue returns resolved formula for formula cell reference', async () => {
            const api = await gridsManager.createGridAndWait('formula-ref-resolve', {
                defaultColDef: { allowFormula: true },
                rowNumbers: true,
                columnDefs: [{ field: 'value' }],
                rowData: [
                    { id: 'raw', value: 100 },
                    { id: 'formula', value: '=REF(COLUMN("value"),ROW("raw"))/2' },
                ],
                getRowId: (params) => params.data.id,
            });

            await asyncSetTimeout(rowNumberRefreshBufferMs);

            const formulaNode = api.getRowNode('formula')!;

            // getDataValue always returns the resolved formula value
            expect(formulaNode.getDataValue('value')).toBe(50);
            expect(formulaNode.getDataValue('value')).toBe(api.getCellValue({ rowNode: formulaNode, colKey: 'value' }));
        });

        test("getDataValue returns raw formula string for 'edit' and 'batch' (mirrors edit-pipeline buffer)", async () => {
            const formulaString = '=REF(COLUMN("value"),ROW("raw"))*3';
            const api = await gridsManager.createGridAndWait('formula-edit-batch-raw', {
                defaultColDef: { allowFormula: true },
                rowNumbers: true,
                columnDefs: [{ field: 'value' }],
                rowData: [
                    { id: 'raw', value: 7 },
                    { id: 'formula', value: formulaString },
                ],
                getRowId: (params) => params.data.id,
            });

            await asyncSetTimeout(rowNumberRefreshBufferMs);

            const formulaNode = api.getRowNode('formula')!;

            // 'data' / 'value' / default: resolved — computed value
            expect(formulaNode.getDataValue('value')).toBe(21); // 7 * 3
            expect(formulaNode.getDataValue('value', 'data')).toBe(21);
            expect(formulaNode.getDataValue('value', 'value')).toBe(21);

            // 'edit' / 'batch': raw formula string (edit pipeline round-trips the formula as-is)
            expect(formulaNode.getDataValue('value', 'edit')).toBe(formulaString);
            expect(formulaNode.getDataValue('value', 'batch')).toBe(formulaString);

            // 'data-raw': already documented as raw (no formula resolution)
            expect(formulaNode.getDataValue('value', 'data-raw')).toBe(formulaString);
        });

        test('getDataValue does NOT evaluate "=..." when allowFormula is false', async () => {
            const notAFormula = '=1+2';
            const api = await gridsManager.createGridAndWait('formula-disabled', {
                // allowFormula omitted — defaults to false
                columnDefs: [{ field: 'value' }],
                rowData: [{ id: 'row1', value: notAFormula }],
                getRowId: (params) => params.data.id,
            });

            const node = api.getRowNode('row1')!;

            // Every `from` must return the raw string; no evaluation gate must fire without allowFormula.
            expect(node.getDataValue('value')).toBe(notAFormula);
            expect(node.getDataValue('value', 'data')).toBe(notAFormula);
            expect(node.getDataValue('value', 'value')).toBe(notAFormula);
            expect(node.getDataValue('value', 'edit')).toBe(notAFormula);
            expect(node.getDataValue('value', 'batch')).toBe(notAFormula);
            expect(node.getDataValue('value', 'data-raw')).toBe(notAFormula);
        });

        test('getDataValue returns error string when formula evaluation fails', async () => {
            const api = await gridsManager.createGridAndWait('formula-error', {
                defaultColDef: { allowFormula: true },
                rowNumbers: true,
                columnDefs: [{ field: 'value' }],
                rowData: [
                    // Reference a non-existent column — evaluator returns a "#REF!"-style error string
                    { id: 'bad', value: '=REF(COLUMN("nonexistent"),ROW("bad"))' },
                ],
                getRowId: (params) => params.data.id,
            });

            await asyncSetTimeout(rowNumberRefreshBufferMs);

            const node = api.getRowNode('bad')!;
            const resolved = node.getDataValue('value');

            // Formula evaluation error surfaces as a string beginning with '#' — not the raw "=..." source
            expect(typeof resolved).toBe('string');
            expect(resolved as string).toMatch(/^#/);
            expect(resolved).not.toBe(node.data!.value);
        });

        test('getDataValue round-trips formula through setDataValue', async () => {
            const api = await gridsManager.createGridAndWait('formula-roundtrip', {
                defaultColDef: { allowFormula: true, editable: true },
                rowNumbers: true,
                columnDefs: [{ field: 'value' }],
                rowData: [
                    { id: 'source', value: 10 },
                    { id: 'target', value: 1 },
                ],
                getRowId: (params) => params.data.id,
            });

            await asyncSetTimeout(rowNumberRefreshBufferMs);

            const target = api.getRowNode('target')!;

            // Write a formula via setDataValue
            const formulaString = '=REF(COLUMN("value"),ROW("source"))*4';
            target.setDataValue('value', formulaString);

            await asyncSetTimeout(rowNumberRefreshBufferMs);

            // 'data' resolves to computed value; 'edit'/'batch'/'data-raw' preserve the raw string
            expect(target.getDataValue('value')).toBe(40); // 10 * 4
            expect(target.getDataValue('value', 'edit')).toBe(formulaString);
            expect(target.getDataValue('value', 'batch')).toBe(formulaString);
            expect(target.getDataValue('value', 'data-raw')).toBe(formulaString);
        });

        test('getDataValue during batch edit of a formula column', async () => {
            const originalFormula = '=REF(COLUMN("value"),ROW("a"))+1';
            const api = await gridsManager.createGridAndWait('formula-batch-edit', {
                defaultColDef: { allowFormula: true, editable: true },
                rowNumbers: true,
                columnDefs: [{ field: 'value' }],
                rowData: [
                    { id: 'a', value: 5 },
                    { id: 'b', value: originalFormula },
                ],
                getRowId: (params) => params.data.id,
            });

            await asyncSetTimeout(rowNumberRefreshBufferMs);

            const b = api.getRowNode('b')!;

            // Baseline: formula evaluates to 6
            expect(b.getDataValue('value')).toBe(6);
            expect(b.getDataValue('value', 'edit')).toBe(originalFormula);

            // Stage a new formula via batch edit
            const newFormula = '=REF(COLUMN("value"),ROW("a"))*10';
            api.startBatchEdit();
            try {
                b.setDataValue('value', newFormula, 'batch');

                // 'data' still sees the committed (original) formula resolved
                expect(b.getDataValue('value', 'data')).toBe(6);
                expect(b.getDataValue('value', 'data-raw')).toBe(originalFormula);

                // 'batch' returns the staged raw formula string (not evaluated)
                expect(b.getDataValue('value', 'batch')).toBe(newFormula);
            } finally {
                api.cancelBatchEdit();
            }

            // After cancelling, state reverts to the original formula
            expect(b.getDataValue('value')).toBe(6);
            expect(b.getDataValue('value', 'batch')).toBe(originalFormula);
        });

        test('getDataValue evaluates chained formula references', async () => {
            const api = await gridsManager.createGridAndWait('formula-chain', {
                defaultColDef: { allowFormula: true },
                rowNumbers: true,
                columnDefs: [{ field: 'value' }],
                rowData: [
                    { id: 'a', value: 2 },
                    { id: 'b', value: '=REF(COLUMN("value"),ROW("a"))*3' }, // 6
                    { id: 'c', value: '=REF(COLUMN("value"),ROW("b"))+1' }, // 7
                ],
                getRowId: (params) => params.data.id,
            });

            await asyncSetTimeout(rowNumberRefreshBufferMs);

            // Each formula in the chain is resolved via the previous one's computed value.
            expect(api.getRowNode('a')!.getDataValue('value')).toBe(2);
            expect(api.getRowNode('b')!.getDataValue('value')).toBe(6);
            expect(api.getRowNode('c')!.getDataValue('value')).toBe(7);
        });

        test('getDataValue on formula returning null/undefined operands', async () => {
            const api = await gridsManager.createGridAndWait('formula-null', {
                defaultColDef: { allowFormula: true },
                rowNumbers: true,
                columnDefs: [{ field: 'value' }],
                rowData: [
                    { id: 'nullCell', value: null },
                    // Summing null with 5 — result depends on evaluator coercion rules; at minimum, should not
                    // throw and should return a defined result (scalar or a '#...' error marker).
                    { id: 'sum', value: '=REF(COLUMN("value"),ROW("nullCell"))+5' },
                ],
                getRowId: (params) => params.data.id,
            });

            await asyncSetTimeout(rowNumberRefreshBufferMs);

            const nullNode = api.getRowNode('nullCell')!;
            const sumNode = api.getRowNode('sum')!;

            // Raw null passes through unchanged on the nullCell row
            expect(nullNode.getDataValue('value')).toBeNull();

            // The formula resolves without throwing — exact value depends on the evaluator's null handling,
            // but it must not be the raw formula string (i.e. resolution did run).
            const sumResolved = sumNode.getDataValue('value');
            expect(sumResolved).not.toBe(sumNode.data!.value);
        });
    });

    describe('pivot mode', () => {
        function createPivotRowData() {
            return [
                { id: '1', country: 'France', year: 2020, sales: 1000 },
                { id: '2', country: 'France', year: 2021, sales: 1200 },
                { id: '3', country: 'Germany', year: 2020, sales: 1500 },
                { id: '4', country: 'Germany', year: 2021, sales: 1800 },
            ];
        }

        test('getDataValue on leaf row with pivot columns', async () => {
            const api = await gridsManager.createGridAndWait('pivot-leaf', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    { field: 'sales', aggFunc: 'sum' },
                ],
                pivotMode: true,
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
                rowData: createPivotRowData(),
            });

            await asyncSetTimeout(1);

            // Get pivot columns
            const pivotColumns = api.getPivotResultColumns();
            const pivotCol2020 = pivotColumns?.find((col) => col.getColId().includes('2020_sales'));
            const pivotCol2021 = pivotColumns?.find((col) => col.getColId().includes('2021_sales'));
            expect(pivotCol2020).toBeDefined();
            expect(pivotCol2021).toBeDefined();

            // Leaf rows under France group
            const franceNode = api.getRowNode('row-group-country-France')!;

            // Group node should return aggregated values
            expect(franceNode.getDataValue(pivotCol2020!)).toBe(1000);
            expect(franceNode.getDataValue(pivotCol2021!)).toBe(1200);

            // Verify matches getCellValue
            expect(franceNode.getDataValue(pivotCol2020!)).toBe(
                api.getCellValue({ rowNode: franceNode, colKey: pivotCol2020! })
            );
        });

        test('getDataValue on leaf group with pivot columns', async () => {
            const api = await gridsManager.createGridAndWait('pivot-leaf-group', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    { field: 'sales', aggFunc: 'sum' },
                ],
                pivotMode: true,
                groupDefaultExpanded: 0, // collapsed by default
                getRowId: ({ data }) => data.id,
                rowData: createPivotRowData(),
            });

            await asyncSetTimeout(1);

            const pivotColumns = api.getPivotResultColumns();
            const pivotCol2020 = pivotColumns?.find((col) => col.getColId().includes('2020_sales'));
            const pivotCol2021 = pivotColumns?.find((col) => col.getColId().includes('2021_sales'));

            // Leaf groups (country groups)
            const franceGroup = api.getRowNode('row-group-country-France')!;
            const germanyGroup = api.getRowNode('row-group-country-Germany')!;

            expect(franceGroup.group).toBe(true);
            expect(germanyGroup.group).toBe(true);

            // Aggregated values for France: 2020=1000, 2021=1200
            expect(franceGroup.getDataValue(pivotCol2020!)).toBe(1000);
            expect(franceGroup.getDataValue(pivotCol2021!)).toBe(1200);

            // Aggregated values for Germany: 2020=1500, 2021=1800
            expect(germanyGroup.getDataValue(pivotCol2020!)).toBe(1500);
            expect(germanyGroup.getDataValue(pivotCol2021!)).toBe(1800);
        });

        test('getDataValue on nested groups with pivot columns', async () => {
            const rowData = [
                { id: '1', region: 'Europe', country: 'France', year: 2020, sales: 1000 },
                { id: '2', region: 'Europe', country: 'France', year: 2021, sales: 1200 },
                { id: '3', region: 'Europe', country: 'Germany', year: 2020, sales: 1500 },
                { id: '4', region: 'Europe', country: 'Germany', year: 2021, sales: 1800 },
                { id: '5', region: 'Americas', country: 'USA', year: 2020, sales: 2000 },
                { id: '6', region: 'Americas', country: 'USA', year: 2021, sales: 2200 },
            ];

            const api = await gridsManager.createGridAndWait('pivot-nested', {
                columnDefs: [
                    { field: 'region', rowGroup: true, hide: true },
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    { field: 'sales', aggFunc: 'sum' },
                ],
                pivotMode: true,
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
                rowData,
            });

            await asyncSetTimeout(1);

            const pivotColumns = api.getPivotResultColumns();
            const pivotCol2020 = pivotColumns?.find((col) => col.getColId().includes('2020_sales'));
            const pivotCol2021 = pivotColumns?.find((col) => col.getColId().includes('2021_sales'));

            // Parent group (region)
            const europeGroup = api.getRowNode('row-group-region-Europe')!;
            expect(europeGroup.group).toBe(true);

            // Europe aggregated: 2020=1000+1500=2500, 2021=1200+1800=3000
            expect(europeGroup.getDataValue(pivotCol2020!)).toBe(2500);
            expect(europeGroup.getDataValue(pivotCol2021!)).toBe(3000);

            // Leaf group (country under region)
            const franceLeafGroup = api.getRowNode('row-group-region-Europe-country-France')!;
            expect(franceLeafGroup.group).toBe(true);
            expect(franceLeafGroup.getDataValue(pivotCol2020!)).toBe(1000);
            expect(franceLeafGroup.getDataValue(pivotCol2021!)).toBe(1200);

            // All should match getCellValue
            expect(europeGroup.getDataValue(pivotCol2020!)).toBe(
                api.getCellValue({ rowNode: europeGroup, colKey: pivotCol2020! })
            );
            expect(franceLeafGroup.getDataValue(pivotCol2021!)).toBe(
                api.getCellValue({ rowNode: franceLeafGroup, colKey: pivotCol2021! })
            );
        });

        test('getDataValue returns aggregated value on pivot columns', async () => {
            const api = await gridsManager.createGridAndWait('pivot-agg', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    { field: 'sales', aggFunc: 'sum' },
                ],
                pivotMode: true,
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
                rowData: createPivotRowData(),
            });

            await asyncSetTimeout(1);

            const pivotColumns = api.getPivotResultColumns();
            const pivotCol2020 = pivotColumns?.find((col) => col.getColId().includes('2020_sales'));

            const franceGroup = api.getRowNode('row-group-country-France')!;

            // getDataValue returns aggregated value for group nodes
            expect(franceGroup.getDataValue(pivotCol2020!)).toBe(1000);
            expect(franceGroup.getDataValue(pivotCol2020!)).toBe(
                api.getCellValue({ rowNode: franceGroup, colKey: pivotCol2020! })
            );
        });

        test('getDataValue on true leaf data row resolves pivot column to underlying value column', async () => {
            const api = await gridsManager.createGridAndWait('pivot-true-leaf-row', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    { field: 'sales', aggFunc: 'sum' },
                ],
                pivotMode: true,
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
                rowData: createPivotRowData(),
            });

            await asyncSetTimeout(1);

            const pivotColumns = api.getPivotResultColumns();
            const pivotCol2020 = pivotColumns?.find((col) => col.getColId().includes('2020_sales'));
            const pivotCol2021 = pivotColumns?.find((col) => col.getColId().includes('2021_sales'));
            expect(pivotCol2020).toBeDefined();
            expect(pivotCol2021).toBeDefined();

            // True leaf data rows (group === false)
            const leafRow2020 = api.getRowNode('1')!; // France, year=2020, sales=1000
            const leafRow2021 = api.getRowNode('2')!; // France, year=2021, sales=1200
            expect(leafRow2020.group).toBe(false);
            expect(leafRow2021.group).toBe(false);

            // Leaf rows resolve pivot columns to the underlying value column (sales).
            // Both pivotCol2020 and pivotCol2021 share the same pivotValueColumn (sales),
            // so getDataValue returns the leaf row's own sales value regardless of which
            // pivot column is queried — the pivot dimension is not applicable at leaf level.
            expect(leafRow2020.getDataValue(pivotCol2020!)).toBe(1000);
            expect(leafRow2020.getDataValue(pivotCol2021!)).toBe(1000);

            expect(leafRow2021.getDataValue(pivotCol2020!)).toBe(1200);
            expect(leafRow2021.getDataValue(pivotCol2021!)).toBe(1200);
        });

        test('getDataValue on true leaf data row: all from modes return underlying value column', async () => {
            const api = await gridsManager.createGridAndWait('pivot-true-leaf-from', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    { field: 'sales', aggFunc: 'sum' },
                ],
                pivotMode: true,
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
                rowData: createPivotRowData(),
            });

            await asyncSetTimeout(1);

            const pivotColumns = api.getPivotResultColumns();
            const pivotCol2020 = pivotColumns?.find((col) => col.getColId().includes('2020_sales'));
            expect(pivotCol2020).toBeDefined();

            const leafRow = api.getRowNode('1')!; // France, year=2020, sales=1000
            expect(leafRow.group).toBe(false);

            // All from modes resolve to the underlying sales value for true leaf rows.
            // Leaf rows have no aggregation or pending edits, so all modes return the same committed value.
            expect(leafRow.getDataValue(pivotCol2020!)).toBe(1000);
            expect(leafRow.getDataValue(pivotCol2020!, 'data')).toBe(1000);
            expect(leafRow.getDataValue(pivotCol2020!, 'data-raw')).toBe(1000);
            expect(leafRow.getDataValue(pivotCol2020!, 'edit')).toBe(1000);
            expect(leafRow.getDataValue(pivotCol2020!, 'batch')).toBe(1000);
            expect(leafRow.getDataValue(pivotCol2020!, 'value')).toBe(1000);
        });
    });

    describe('aggregation without pivot', () => {
        test('getDataValue returns aggregated value on non-pivot group rows', async () => {
            const api = await gridsManager.createGridAndWait('agg-group', {
                columnDefs: [
                    { field: 'category', rowGroup: true, hide: true },
                    { field: 'value', aggFunc: 'sum' },
                    { field: 'min', aggFunc: 'min' },
                ],
                rowData: [
                    { id: '1', category: 'A', value: 100, min: 10 },
                    { id: '2', category: 'A', value: 200, min: 5 },
                    { id: '3', category: 'B', value: 300, min: 20 },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: 1,
            });

            await asyncSetTimeout(1);

            // Find group A
            let groupA: ReturnType<typeof api.getRowNode>;
            api.forEachNode((node) => {
                if (node.group && node.key === 'A') {
                    groupA = node;
                }
            });

            expect(groupA).toBeDefined();
            expect(groupA!.getDataValue('value')).toBe(300); // 100 + 200
            expect(groupA!.getDataValue('min')).toBe(5); // min of 10, 5
        });

        test('getDataValue with multiple aggregation functions', async () => {
            const api = await gridsManager.createGridAndWait('multi-agg', {
                columnDefs: [
                    { field: 'group', rowGroup: true, hide: true },
                    { field: 'quantity', aggFunc: 'sum' },
                    { field: 'revenue', aggFunc: 'max' },
                    { field: 'cost', aggFunc: 'min' },
                ],
                rowData: [
                    { id: '1', group: 'X', quantity: 5, revenue: 50, cost: 10 },
                    { id: '2', group: 'X', quantity: 3, revenue: 60, cost: 8 },
                    { id: '3', group: 'X', quantity: 2, revenue: 40, cost: 12 },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: 1,
            });

            await asyncSetTimeout(1);

            let groupX: ReturnType<typeof api.getRowNode>;
            api.forEachNode((node) => {
                if (node.group && node.key === 'X') {
                    groupX = node;
                }
            });

            expect(groupX).toBeDefined();
            expect(groupX!.getDataValue('quantity')).toBe(10); // sum of 5, 3, 2
            expect(groupX!.getDataValue('revenue')).toBe(60); // max of 50, 60, 40
            expect(groupX!.getDataValue('cost')).toBe(8); // min of 10, 8, 12
        });

        test('getDataValue on group row matches getCellValue for aggregations', async () => {
            const api = await gridsManager.createGridAndWait('agg-match', {
                columnDefs: [
                    { field: 'type', rowGroup: true, hide: true },
                    { field: 'amount', aggFunc: 'sum' },
                ],
                rowData: [
                    { id: '1', type: 'Income', amount: 1000 },
                    { id: '2', type: 'Income', amount: 500 },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: 1,
            });

            await asyncSetTimeout(1);

            let incomeGroup: ReturnType<typeof api.getRowNode>;
            api.forEachNode((node) => {
                if (node.group && node.key === 'Income') {
                    incomeGroup = node;
                }
            });

            expect(incomeGroup!.getDataValue('amount')).toBe(
                api.getCellValue({ rowNode: incomeGroup!, colKey: 'amount' })
            );
            expect(incomeGroup!.getDataValue('amount')).toBe(1500);
        });
    });

    describe('built-in aggregation functions on group rows', () => {
        function findGroup(api: any, key: string): any {
            let found: any;
            api.forEachNode((node: any) => {
                if (node.group && node.key === key) {
                    found = node;
                }
            });
            return found;
        }

        test('sum returns a plain scalar on group rows', async () => {
            const api = await gridsManager.createGridAndWait('agg-sum-type', {
                columnDefs: [
                    { field: 'cat', rowGroup: true, hide: true },
                    { field: 'v', aggFunc: 'sum' },
                ],
                rowData: [
                    { id: '1', cat: 'A', v: 10 },
                    { id: '2', cat: 'A', v: 20 },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: 1,
            });
            await asyncSetTimeout(1);

            const group = findGroup(api, 'A')!;
            const val = group.getDataValue('v');

            expect(typeof val).toBe('number');
            expect(val).toBe(30);
        });

        test('min returns a plain scalar on group rows', async () => {
            const api = await gridsManager.createGridAndWait('agg-min-type', {
                columnDefs: [
                    { field: 'cat', rowGroup: true, hide: true },
                    { field: 'v', aggFunc: 'min' },
                ],
                rowData: [
                    { id: '1', cat: 'A', v: 10 },
                    { id: '2', cat: 'A', v: 20 },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: 1,
            });
            await asyncSetTimeout(1);

            const group = findGroup(api, 'A')!;
            const val = group.getDataValue('v');

            expect(typeof val).toBe('number');
            expect(val).toBe(10);
        });

        test('max returns a plain scalar on group rows', async () => {
            const api = await gridsManager.createGridAndWait('agg-max-type', {
                columnDefs: [
                    { field: 'cat', rowGroup: true, hide: true },
                    { field: 'v', aggFunc: 'max' },
                ],
                rowData: [
                    { id: '1', cat: 'A', v: 10 },
                    { id: '2', cat: 'A', v: 20 },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: 1,
            });
            await asyncSetTimeout(1);

            const group = findGroup(api, 'A')!;
            const val = group.getDataValue('v');

            expect(typeof val).toBe('number');
            expect(val).toBe(20);
        });

        test('first returns a plain scalar on group rows', async () => {
            const api = await gridsManager.createGridAndWait('agg-first-type', {
                columnDefs: [
                    { field: 'cat', rowGroup: true, hide: true },
                    { field: 'v', aggFunc: 'first' },
                ],
                rowData: [
                    { id: '1', cat: 'A', v: 'alpha' },
                    { id: '2', cat: 'A', v: 'beta' },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: 1,
            });
            await asyncSetTimeout(1);

            const group = findGroup(api, 'A')!;
            const val = group.getDataValue('v');

            expect(typeof val).toBe('string');
            expect(val).toBe('alpha');
        });

        test('last returns a plain scalar on group rows', async () => {
            const api = await gridsManager.createGridAndWait('agg-last-type', {
                columnDefs: [
                    { field: 'cat', rowGroup: true, hide: true },
                    { field: 'v', aggFunc: 'last' },
                ],
                rowData: [
                    { id: '1', cat: 'A', v: 'alpha' },
                    { id: '2', cat: 'A', v: 'beta' },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: 1,
            });
            await asyncSetTimeout(1);

            const group = findGroup(api, 'A')!;
            const val = group.getDataValue('v');

            expect(typeof val).toBe('string');
            expect(val).toBe('beta');
        });

        test('avg returns a wrapped object (not a scalar) on group rows', async () => {
            const api = await gridsManager.createGridAndWait('agg-avg-type', {
                columnDefs: [
                    { field: 'cat', rowGroup: true, hide: true },
                    { field: 'v', aggFunc: 'avg' },
                ],
                rowData: [
                    { id: '1', cat: 'A', v: 10 },
                    { id: '2', cat: 'A', v: 20 },
                    { id: '3', cat: 'A', v: 30 },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: 1,
            });
            await asyncSetTimeout(1);

            const group = findGroup(api, 'A')!;
            const val = group.getDataValue('v');

            // avg returns { value, count, toNumber(), toString() } — NOT a plain number
            expect(typeof val).toBe('object');
            expect(val).not.toBeNull();
            expect(val.value).toBe(20); // (10 + 20 + 30) / 3
            expect(val.count).toBe(3);
            expect(val.toNumber()).toBe(20);
            expect(val.toString()).toBe('20');

            // Leaf rows return plain scalars
            expect(api.getRowNode('1')!.getDataValue('v')).toBe(10);
        });

        test('count returns a wrapped object (not a scalar) on group rows', async () => {
            const api = await gridsManager.createGridAndWait('agg-count-type', {
                columnDefs: [
                    { field: 'cat', rowGroup: true, hide: true },
                    { field: 'v', aggFunc: 'count' },
                ],
                rowData: [
                    { id: '1', cat: 'A', v: 'x' },
                    { id: '2', cat: 'A', v: 'y' },
                    { id: '3', cat: 'B', v: 'z' },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: 1,
            });
            await asyncSetTimeout(1);

            const group = findGroup(api, 'A')!;
            const val = group.getDataValue('v');

            // count returns { value, toNumber(), toString() } — NOT a plain number
            expect(typeof val).toBe('object');
            expect(val).not.toBeNull();
            expect(val.value).toBe(2);
            expect(val.toNumber()).toBe(2);
            expect(val.toString()).toBe('2');
        });

        test('avg with nested groups returns wrapped objects at all levels', async () => {
            const api = await gridsManager.createGridAndWait('agg-avg-nested', {
                columnDefs: [
                    { field: 'region', rowGroup: true, hide: true },
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'v', aggFunc: 'avg' },
                ],
                rowData: [
                    { id: '1', region: 'EU', country: 'FR', v: 10 },
                    { id: '2', region: 'EU', country: 'FR', v: 20 },
                    { id: '3', region: 'EU', country: 'DE', v: 30 },
                    { id: '4', region: 'EU', country: 'DE', v: 40 },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: -1,
            });
            await asyncSetTimeout(1);

            let euGroup: any, frGroup: any;
            api.forEachNode((node: any) => {
                if (node.group && node.key === 'EU' && node.level === 0) {
                    euGroup = node;
                } else if (node.group && node.key === 'FR' && node.level === 1) {
                    frGroup = node;
                }
            });

            // FR: avg(10,20) = 15, count=2
            const frAvg = frGroup!.getDataValue('v');
            expect(typeof frAvg).toBe('object');
            expect(frAvg.value).toBe(15);
            expect(frAvg.count).toBe(2);

            // EU: weighted avg (15*2 + 35*2)/4 = 25, count=4
            const euAvg = euGroup!.getDataValue('v');
            expect(typeof euAvg).toBe('object');
            expect(euAvg.value).toBe(25);
            expect(euAvg.count).toBe(4);
        });
    });

    describe('custom aggregation functions returning objects', () => {
        function findGroup(api: any, key: string): any {
            let found: any;
            api.forEachNode((node: any) => {
                if (node.group && node.key === key) {
                    found = node;
                }
            });
            return found;
        }

        test('custom aggFunc returning plain object preserves it on group rows', async () => {
            interface CustomAggResult {
                total: number;
                items: number;
                label: string;
            }

            const api = await gridsManager.createGridAndWait('agg-custom-plain', {
                columnDefs: [
                    { field: 'cat', rowGroup: true, hide: true },
                    {
                        field: 'v',
                        aggFunc: (params) => {
                            let total = 0;
                            let items = 0;
                            for (const value of params.values) {
                                if (typeof value === 'number') {
                                    total += value;
                                    items += 1;
                                } else if (value && typeof value === 'object' && 'total' in value) {
                                    total += (value as CustomAggResult).total;
                                    items += (value as CustomAggResult).items;
                                }
                            }
                            return { total, items, label: `${total}/${items}` } satisfies CustomAggResult;
                        },
                    },
                ],
                rowData: [
                    { id: '1', cat: 'A', v: 100 },
                    { id: '2', cat: 'A', v: 200 },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: 1,
            });
            await asyncSetTimeout(1);

            const group = findGroup(api, 'A')!;
            const val = group.getDataValue('v') as CustomAggResult;

            expect(typeof val).toBe('object');
            expect(val.total).toBe(300);
            expect(val.items).toBe(2);
            expect(val.label).toBe('300/2');

            // Leaf rows return plain scalar
            expect(api.getRowNode('1')!.getDataValue('v')).toBe(100);
        });

        test('custom aggFunc returning object with toNumber() preserves the full object', async () => {
            // A user creates a custom aggregation that returns an object with toNumber/toString
            // — similar to AG Grid's internal avg/count wrappers.
            // getDataValue should return the full object, not resolve it.
            const api = await gridsManager.createGridAndWait('agg-custom-toNumber', {
                columnDefs: [
                    { field: 'cat', rowGroup: true, hide: true },
                    {
                        field: 'v',
                        aggFunc: (params) => {
                            let sum = 0;
                            let count = 0;
                            for (const value of params.values) {
                                if (typeof value === 'number') {
                                    sum += value;
                                    count += 1;
                                } else if (value && typeof value === 'object' && typeof value.toNumber === 'function') {
                                    sum += value.sum;
                                    count += value.count;
                                }
                            }
                            return {
                                sum,
                                count,
                                toNumber() {
                                    return sum;
                                },
                                toString() {
                                    return `sum=${sum}`;
                                },
                            };
                        },
                    },
                ],
                rowData: [
                    { id: '1', cat: 'A', v: 10 },
                    { id: '2', cat: 'A', v: 20 },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: 1,
            });
            await asyncSetTimeout(1);

            const group = findGroup(api, 'A')!;
            const val = group.getDataValue('v');

            // The full custom object is returned — including toNumber/toString
            expect(typeof val).toBe('object');
            expect(val.sum).toBe(30);
            expect(val.count).toBe(2);
            expect(val.toNumber()).toBe(30);
            expect(val.toString()).toBe('sum=30');
        });

        test('custom aggFunc returning object with toString() but no toNumber() preserves object', async () => {
            const api = await gridsManager.createGridAndWait('agg-custom-toString', {
                columnDefs: [
                    { field: 'cat', rowGroup: true, hide: true },
                    {
                        field: 'v',
                        aggFunc: (params) => {
                            const items = params.values.filter((v) => typeof v === 'string');
                            return {
                                items,
                                toString() {
                                    return items.join(', ');
                                },
                            };
                        },
                    },
                ],
                rowData: [
                    { id: '1', cat: 'A', v: 'hello' },
                    { id: '2', cat: 'A', v: 'world' },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: 1,
            });
            await asyncSetTimeout(1);

            const group = findGroup(api, 'A')!;
            const val = group.getDataValue('v');

            expect(typeof val).toBe('object');
            expect(val.items).toEqual(['hello', 'world']);
            expect(val.toString()).toBe('hello, world');
            expect(val.toNumber).toBeUndefined(); // no toNumber
        });
    });

    describe('valueGetter returning custom objects', () => {
        test('valueGetter returning object with amount/currency preserves it', async () => {
            interface Money {
                amount: number;
                currency: string;
            }

            const api = await gridsManager.createGridAndWait('vg-money', {
                columnDefs: [
                    { field: 'name' },
                    {
                        colId: 'price',
                        valueGetter: (params) =>
                            ({ amount: params.data.price, currency: params.data.currency }) satisfies Money,
                    },
                ],
                rowData: [
                    { id: '1', name: 'Widget', price: 9.99, currency: 'USD' },
                    { id: '2', name: 'Gadget', price: 19.99, currency: 'EUR' },
                ],
                getRowId: (params) => params.data.id,
            });

            const row1 = api.getRowNode('1')!;
            const val1 = row1.getDataValue('price') as Money;

            expect(typeof val1).toBe('object');
            expect(val1.amount).toBe(9.99);
            expect(val1.currency).toBe('USD');

            const row2 = api.getRowNode('2')!;
            const val2 = row2.getDataValue('price') as Money;

            expect(val2.amount).toBe(19.99);
            expect(val2.currency).toBe('EUR');
        });

        test('valueGetter returning object with toNumber() preserves the full object', async () => {
            // User object that happens to have toNumber/toString — should NOT be resolved
            const api = await gridsManager.createGridAndWait('vg-toNumber', {
                columnDefs: [
                    {
                        colId: 'measurement',
                        valueGetter: (params) => ({
                            value: params.data.value,
                            unit: params.data.unit,
                            toNumber() {
                                return params.data.value;
                            },
                            toString() {
                                return `${params.data.value}${params.data.unit}`;
                            },
                        }),
                    },
                ],
                rowData: [
                    { id: '1', value: 42, unit: 'kg' },
                    { id: '2', value: 100, unit: 'cm' },
                ],
                getRowId: (params) => params.data.id,
            });

            const row = api.getRowNode('1')!;
            const val = row.getDataValue('measurement');

            // Full object preserved — not resolved to 42
            expect(typeof val).toBe('object');
            expect(val.value).toBe(42);
            expect(val.unit).toBe('kg');
            expect(val.toNumber()).toBe(42);
            expect(val.toString()).toBe('42kg');
        });

        test('valueGetter returning object with value property preserves the full object', async () => {
            // User object with a .value property — should NOT be unwrapped
            const api = await gridsManager.createGridAndWait('vg-value-prop', {
                columnDefs: [
                    {
                        colId: 'wrapper',
                        valueGetter: (params) => ({
                            value: params.data.score,
                            confidence: params.data.confidence,
                        }),
                    },
                ],
                rowData: [{ id: '1', score: 95, confidence: 0.8 }],
                getRowId: (params) => params.data.id,
            });

            const row = api.getRowNode('1')!;
            const val = row.getDataValue('wrapper');

            expect(typeof val).toBe('object');
            expect(val.value).toBe(95);
            expect(val.confidence).toBe(0.8);
        });

        test('field data containing object with toNumber/toString preserves it', async () => {
            // Data field directly contains an object with toNumber/toString
            const customObj = {
                raw: 123,
                toNumber() {
                    return 123;
                },
                toString() {
                    return 'custom-123';
                },
            };

            const api = await gridsManager.createGridAndWait('field-toNumber', {
                columnDefs: [{ field: 'data', cellDataType: false }],
                rowData: [{ id: '1', data: customObj }],
                getRowId: (params) => params.data.id,
            });

            const row = api.getRowNode('1')!;
            const val = row.getDataValue('data');

            expect(typeof val).toBe('object');
            expect(val.raw).toBe(123);
            expect(val.toNumber()).toBe(123);
            expect(val.toString()).toBe('custom-123');
        });
    });

    describe('tree data with aggregation objects', () => {
        test('avg aggregation on tree data parent returns wrapped object', async () => {
            const api = await gridsManager.createGridAndWait('tree-avg', {
                columnDefs: [{ field: 'name' }, { field: 'v', aggFunc: 'avg' }],
                treeData: true,
                treeDataChildrenField: 'children',
                rowData: [
                    {
                        id: '1',
                        name: 'Parent',
                        v: 10,
                        children: [
                            { id: '1-1', name: 'Child 1', v: 20 },
                            { id: '1-2', name: 'Child 2', v: 40 },
                        ],
                    },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: -1,
            });
            await asyncSetTimeout(1);

            const parent = api.getRowNode('1')!;
            const child = api.getRowNode('1-1')!;

            // Parent has aggregated avg from children — wrapped object
            const parentVal = parent.getDataValue('v');
            expect(typeof parentVal).toBe('object');
            expect(parentVal.value).toBe(30); // (20 + 40) / 2
            expect(parentVal.count).toBe(2);

            // Child returns plain scalar
            expect(child.getDataValue('v')).toBe(20);
        });

        test('sum aggregation on tree data parent returns plain scalar', async () => {
            const api = await gridsManager.createGridAndWait('tree-sum', {
                columnDefs: [{ field: 'name' }, { field: 'v', aggFunc: 'sum' }],
                treeData: true,
                treeDataChildrenField: 'children',
                rowData: [
                    {
                        id: '1',
                        name: 'Parent',
                        v: 10,
                        children: [
                            { id: '1-1', name: 'A', v: 20 },
                            { id: '1-2', name: 'B', v: 30 },
                        ],
                    },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: -1,
            });
            await asyncSetTimeout(1);

            const parent = api.getRowNode('1')!;
            const parentVal = parent.getDataValue('v');

            expect(typeof parentVal).toBe('number');
            expect(parentVal).toBe(50); // 20 + 30
        });

        test('custom aggFunc on tree data preserves full object', async () => {
            const api = await gridsManager.createGridAndWait('tree-custom-agg', {
                columnDefs: [
                    { field: 'name' },
                    {
                        field: 'v',
                        aggFunc: (params) => {
                            let sum = 0;
                            for (const v of params.values) {
                                sum += typeof v === 'number' ? v : typeof v === 'object' && v ? v.sum : 0;
                            }
                            return { sum, source: 'custom' };
                        },
                    },
                ],
                treeData: true,
                treeDataChildrenField: 'children',
                rowData: [
                    {
                        id: '1',
                        name: 'Root',
                        v: 0,
                        children: [
                            { id: '1-1', name: 'A', v: 10 },
                            { id: '1-2', name: 'B', v: 20 },
                        ],
                    },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: -1,
            });
            await asyncSetTimeout(1);

            const root = api.getRowNode('1')!;
            const val = root.getDataValue('v');

            expect(typeof val).toBe('object');
            expect(val.sum).toBe(30);
            expect(val.source).toBe('custom');
        });
    });

    describe('getDataValue vs getCellValue divergence', () => {
        function findGroup(api: any, key: string): any {
            let found: any;
            api.forEachNode((node: any) => {
                if (node.group && node.key === key) {
                    found = node;
                }
            });
            return found;
        }

        test('avg: getDataValue returns object, getCellValue also returns same object', async () => {
            const api = await gridsManager.createGridAndWait('diverge-avg', {
                columnDefs: [
                    { field: 'cat', rowGroup: true, hide: true },
                    { field: 'v', aggFunc: 'avg' },
                ],
                rowData: [
                    { id: '1', cat: 'A', v: 10 },
                    { id: '2', cat: 'A', v: 30 },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: 1,
            });
            await asyncSetTimeout(1);

            const group = findGroup(api, 'A')!;
            const dataVal = group.getDataValue('v');
            const cellVal = api.getCellValue({ rowNode: group, colKey: 'v' });
            const cellValData = api.getCellValue({ rowNode: group, colKey: 'v', from: 'data' });

            // Document what each returns
            expect(typeof dataVal).toBe('object');
            expect(dataVal.value).toBe(20);
            expect(typeof cellVal).toBe('object');
            expect(cellVal.value).toBe(20);
            expect(typeof cellValData).toBe('object');
            expect(cellValData.value).toBe(20);

            // Are they the same reference?
            expect(dataVal).toBe(cellVal);
            expect(dataVal).toBe(cellValData);
        });

        test('avg: expanded group with footer — getDataValue returns aggData, getCellValue skips it', async () => {
            // When groupTotalRow is set, expanded groups have a sibling (footer).
            // getCellValue respects displayIgnoresAggData (UI concern: footer shows the value),
            // but getDataValue always returns the actual data regardless of display settings.
            const api = await gridsManager.createGridAndWait('diverge-avg-footer', {
                columnDefs: [
                    { field: 'cat', rowGroup: true, hide: true },
                    { field: 'v', aggFunc: 'avg' },
                ],
                rowData: [
                    { id: '1', cat: 'A', v: 10 },
                    { id: '2', cat: 'A', v: 30 },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: 1,
                groupTotalRow: 'bottom',
            });
            await asyncSetTimeout(1);

            const group = findGroup(api, 'A')!;
            expect(group.expanded).toBe(true);
            expect(group.sibling).toBeDefined(); // footer sibling exists

            // getDataValue always returns the actual agg data (not a UI concern)
            const dataVal = group.getDataValue('v');
            expect(typeof dataVal).toBe('object');
            expect(dataVal.value).toBe(20);

            // getCellValue skips aggData when the group is expanded with a footer sibling
            // (display logic: the agg value is shown on the footer row, not the group header)
            const cellVal = api.getCellValue({ rowNode: group, colKey: 'v' });
            expect(cellVal).toBeUndefined();

            // The footer sibling also has the aggregated value
            const footer = group.sibling!;
            expect(footer.footer).toBe(true);
            const footerVal = footer.getDataValue('v');
            expect(typeof footerVal).toBe('object');
            expect(footerVal.value).toBe(20);
        });

        test('avg: expanded group with footer + groupSuppressBlankHeader — aggData is preserved', async () => {
            // When groupSuppressBlankHeader=true, the group header DOES show aggregated values
            // even when expanded with footer.
            const api = await gridsManager.createGridAndWait('diverge-avg-footer-suppress', {
                columnDefs: [
                    { field: 'cat', rowGroup: true, hide: true },
                    { field: 'v', aggFunc: 'avg' },
                ],
                rowData: [
                    { id: '1', cat: 'A', v: 10 },
                    { id: '2', cat: 'A', v: 30 },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: 1,
                groupTotalRow: 'bottom',
                groupSuppressBlankHeader: true,
            });
            await asyncSetTimeout(1);

            const group = findGroup(api, 'A')!;
            expect(group.expanded).toBe(true);
            expect(group.sibling).toBeDefined();

            // With groupSuppressBlankHeader=true, aggData is NOT skipped
            const dataVal = group.getDataValue('v');
            const cellVal = api.getCellValue({ rowNode: group, colKey: 'v' });

            expect(typeof dataVal).toBe('object');
            expect(dataVal.value).toBe(20);
            expect(typeof cellVal).toBe('object');
            expect(cellVal.value).toBe(20);
            expect(dataVal).toBe(cellVal);
        });

        test('pivot + avg: getDataValue on group row returns wrapped object', async () => {
            const api = await gridsManager.createGridAndWait('diverge-pivot-avg', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    { field: 'score', aggFunc: 'avg' },
                ],
                pivotMode: true,
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
                rowData: [
                    { id: '1', country: 'FR', year: 2020, score: 10 },
                    { id: '2', country: 'FR', year: 2020, score: 30 },
                    { id: '3', country: 'FR', year: 2021, score: 50 },
                ],
            });
            await asyncSetTimeout(1);

            const pivotColumns = api.getPivotResultColumns();
            const pivotCol2020 = pivotColumns?.find((col: any) => col.getColId().includes('2020'));
            expect(pivotCol2020).toBeDefined();

            const frGroup = api.getRowNode('row-group-country-FR')!;
            expect(frGroup.group).toBe(true);

            const dataVal = frGroup.getDataValue(pivotCol2020!);
            const cellVal = api.getCellValue({ rowNode: frGroup, colKey: pivotCol2020! });

            // avg on pivot group row — should be wrapped object
            expect(typeof dataVal).toBe('object');
            expect(dataVal.value).toBe(20); // avg(10, 30)
            expect(dataVal.count).toBe(2);

            // getCellValue should return same thing
            expect(typeof cellVal).toBe('object');
            expect(cellVal.value).toBe(20);
        });

        test('pivot + avg: getDataValue on leaf row resolves pivotValueColumn', async () => {
            const api = await gridsManager.createGridAndWait('diverge-pivot-avg-leaf', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    { field: 'score', aggFunc: 'avg' },
                ],
                pivotMode: true,
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
                rowData: [
                    { id: '1', country: 'FR', year: 2020, score: 10 },
                    { id: '2', country: 'FR', year: 2021, score: 50 },
                ],
            });
            await asyncSetTimeout(1);

            const pivotColumns = api.getPivotResultColumns();
            const pivotCol2020 = pivotColumns?.find((col: any) => col.getColId().includes('2020'));
            expect(pivotCol2020).toBeDefined();

            // Leaf row under the group
            const leafNode = api.getRowNode('1')!;
            expect(leafNode.group).toBe(false);

            const dataVal = leafNode.getDataValue(pivotCol2020!);
            const cellVal = api.getCellValue({ rowNode: leafNode, colKey: pivotCol2020! });

            // Leaf row: pivot column resolves to underlying value column → reads from data
            // Should return plain scalar (the original score value), not a wrapped object
            expect(dataVal).toBe(10);
            expect(cellVal).toBe(10);
        });

        test('count: getDataValue returns object, getCellValue returns same', async () => {
            const api = await gridsManager.createGridAndWait('diverge-count', {
                columnDefs: [
                    { field: 'cat', rowGroup: true, hide: true },
                    { field: 'v', aggFunc: 'count' },
                ],
                rowData: [
                    { id: '1', cat: 'A', v: 'x' },
                    { id: '2', cat: 'A', v: 'y' },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: 1,
            });
            await asyncSetTimeout(1);

            const group = findGroup(api, 'A')!;
            const dataVal = group.getDataValue('v');
            const cellVal = api.getCellValue({ rowNode: group, colKey: 'v' });

            expect(typeof dataVal).toBe('object');
            expect(dataVal.value).toBe(2);
            expect(typeof cellVal).toBe('object');
            expect(cellVal.value).toBe(2);
            expect(dataVal).toBe(cellVal);
        });
    });

    describe('from parameter', () => {
        test('from defaults to data — returns committed value during batch edit', async () => {
            const api = await gridsManager.createGridAndWait('from-data', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
                rowData: [{ id: '0', a: 'original' }],
                getRowId: (params) => params.data.id,
            });

            api.startBatchEdit();
            const rowNode = api.getRowNode('0')!;
            rowNode.setDataValue('a', 'pending', 'batch');

            // default (no from) returns committed data
            expect(rowNode.getDataValue('a')).toBe('original');
            // explicit 'data' is the same
            expect(rowNode.getDataValue('a', 'data')).toBe('original');

            api.cancelBatchEdit();
        });

        test('from: batch returns pending batch value', async () => {
            const api = await gridsManager.createGridAndWait('from-batch', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
                rowData: [{ id: '0', a: 'original' }],
                getRowId: (params) => params.data.id,
            });

            api.startBatchEdit();
            const rowNode = api.getRowNode('0')!;
            rowNode.setDataValue('a', 'pending', 'batch');

            // from: 'batch' returns the pending batch value
            expect(rowNode.getDataValue('a', 'batch')).toBe('pending');

            // from: 'data' still returns committed
            expect(rowNode.getDataValue('a', 'data')).toBe('original');

            api.cancelBatchEdit();
        });

        test('from: edit returns editor value when cell is being edited', async () => {
            const api = await gridsManager.createGridAndWait('from-edit', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
                rowData: [{ id: '0', a: 'original' }],
                getRowId: (params) => params.data.id,
            });

            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);
            const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));

            // Start editing
            await userEvent.dblClick(cellA);
            const editor = await waitForInput(gridDiv, cellA, { popup: false });
            await userEvent.clear(editor);
            await userEvent.type(editor, 'typing');
            await asyncSetTimeout(1);

            const rowNode = api.getRowNode('0')!;

            // from: 'edit' returns live editor value
            expect(rowNode.getDataValue('a', 'edit')).toBe('typing');

            // from: 'data' returns committed
            expect(rowNode.getDataValue('a', 'data')).toBe('original');

            // default (no from) returns committed
            expect(rowNode.getDataValue('a')).toBe('original');
        });

        test('from: edit outside editor returns committed value', async () => {
            const api = await gridsManager.createGridAndWait('from-edit-no-editor', {
                columnDefs: [{ field: 'a', editable: true }],
                rowData: [{ id: '0', a: 'value' }],
                getRowId: (params) => params.data.id,
            });

            const rowNode = api.getRowNode('0')!;

            // No editor open — from: 'edit' still returns committed data
            expect(rowNode.getDataValue('a', 'edit')).toBe('value');
            expect(rowNode.getDataValue('a', 'data')).toBe('value');
            expect(rowNode.getDataValue('a')).toBe('value');
        });

        test('from: batch outside batch mode returns committed value', async () => {
            const api = await gridsManager.createGridAndWait('from-batch-no-batch', {
                columnDefs: [{ field: 'a', editable: true }],
                rowData: [{ id: '0', a: 'value' }],
                getRowId: (params) => params.data.id,
            });

            const rowNode = api.getRowNode('0')!;

            // No batch active — from: 'batch' returns committed data
            expect(rowNode.getDataValue('a', 'batch')).toBe('value');
        });

        test('from: data returns raw agg object on group rows', async () => {
            const api = await gridsManager.createGridAndWait('from-agg-data', {
                columnDefs: [
                    { field: 'cat', rowGroup: true, hide: true },
                    { field: 'v', aggFunc: 'avg', editable: true },
                ],
                rowData: [
                    { id: '1', cat: 'A', v: 10 },
                    { id: '2', cat: 'A', v: 30 },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: 1,
            });
            await asyncSetTimeout(1);

            let group: any;
            api.forEachNode((node: any) => {
                if (node.group && node.key === 'A') {
                    group = node;
                }
            });

            // default returns avg wrapper object
            const aggVal = group!.getDataValue('v');
            expect(typeof aggVal).toBe('object');
            expect(aggVal.value).toBe(20);
            expect(aggVal.count).toBe(2);

            // explicit 'data' returns the same wrapper object
            const aggValData = group!.getDataValue('v', 'data');
            expect(aggValData).toBe(aggVal);
        });

        test('from: edit resolves agg object to scalar on group rows', async () => {
            const api = await gridsManager.createGridAndWait('from-agg-edit', {
                columnDefs: [
                    { field: 'cat', rowGroup: true, hide: true },
                    { field: 'v', aggFunc: 'avg', editable: true },
                ],
                rowData: [
                    { id: '1', cat: 'A', v: 10 },
                    { id: '2', cat: 'A', v: 30 },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: 1,
            });
            await asyncSetTimeout(1);

            let group: any;
            api.forEachNode((node: any) => {
                if (node.group && node.key === 'A') {
                    group = node;
                }
            });

            // 'data' returns raw wrapper
            const rawVal = group!.getDataValue('v', 'data');
            expect(typeof rawVal).toBe('object');
            expect(rawVal.value).toBe(20);

            // 'edit' resolves the wrapper via toNumber()
            const editVal = group!.getDataValue('v', 'edit');
            expect(editVal).toBe(20);
            expect(typeof editVal).toBe('number');
        });

        test('from: batch resolves agg object to scalar on group rows', async () => {
            const api = await gridsManager.createGridAndWait('from-agg-batch', {
                columnDefs: [
                    { field: 'cat', rowGroup: true, hide: true },
                    { field: 'v', aggFunc: 'avg', editable: true },
                ],
                rowData: [
                    { id: '1', cat: 'A', v: 10 },
                    { id: '2', cat: 'A', v: 30 },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: 1,
            });
            await asyncSetTimeout(1);

            let group: any;
            api.forEachNode((node: any) => {
                if (node.group && node.key === 'A') {
                    group = node;
                }
            });

            // 'batch' resolves the wrapper via toNumber()
            const batchVal = group!.getDataValue('v', 'batch');
            expect(batchVal).toBe(20);
            expect(typeof batchVal).toBe('number');
        });

        test('from: edit resolves count agg object to scalar', async () => {
            const api = await gridsManager.createGridAndWait('from-count-edit', {
                columnDefs: [
                    { field: 'cat', rowGroup: true, hide: true },
                    { field: 'v', aggFunc: 'count' },
                ],
                rowData: [
                    { id: '1', cat: 'A', v: 'x' },
                    { id: '2', cat: 'A', v: 'y' },
                    { id: '3', cat: 'A', v: 'z' },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: 1,
            });
            await asyncSetTimeout(1);

            let group: any;
            api.forEachNode((node: any) => {
                if (node.group && node.key === 'A') {
                    group = node;
                }
            });

            // 'data' returns count wrapper
            const rawVal = group!.getDataValue('v', 'data');
            expect(typeof rawVal).toBe('object');
            expect(rawVal.value).toBe(3);

            // 'edit' resolves to scalar
            expect(group!.getDataValue('v', 'edit')).toBe(3);
        });

        test('from: edit does not resolve sum (already scalar)', async () => {
            const api = await gridsManager.createGridAndWait('from-sum-edit', {
                columnDefs: [
                    { field: 'cat', rowGroup: true, hide: true },
                    { field: 'v', aggFunc: 'sum' },
                ],
                rowData: [
                    { id: '1', cat: 'A', v: 10 },
                    { id: '2', cat: 'A', v: 20 },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: 1,
            });
            await asyncSetTimeout(1);

            let group: any;
            api.forEachNode((node: any) => {
                if (node.group && node.key === 'A') {
                    group = node;
                }
            });

            // sum returns plain scalar for both modes
            expect(group!.getDataValue('v', 'data')).toBe(30);
            expect(group!.getDataValue('v', 'edit')).toBe(30);
        });

        test('from: edit on leaf row returns same value as data', async () => {
            const api = await gridsManager.createGridAndWait('from-leaf-edit', {
                columnDefs: [{ field: 'v', editable: true }],
                rowData: [{ id: '1', v: 42 }],
                getRowId: (params) => params.data.id,
            });

            const row = api.getRowNode('1')!;
            expect(row.getDataValue('v', 'edit')).toBe(42);
            expect(row.getDataValue('v', 'data')).toBe(42);
            expect(row.getDataValue('v')).toBe(42);
        });

        test('from: value resolves avg agg object to scalar (committed data)', async () => {
            const api = await gridsManager.createGridAndWait('from-value-avg', {
                columnDefs: [
                    { field: 'cat', rowGroup: true, hide: true },
                    { field: 'v', aggFunc: 'avg' },
                ],
                rowData: [
                    { id: '1', cat: 'A', v: 10 },
                    { id: '2', cat: 'A', v: 30 },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: 1,
            });
            await asyncSetTimeout(1);

            let group: any;
            api.forEachNode((node: any) => {
                if (node.group && node.key === 'A') {
                    group = node;
                }
            });

            // 'data' returns raw wrapper
            const rawVal = group!.getDataValue('v', 'data');
            expect(typeof rawVal).toBe('object');
            expect(rawVal.value).toBe(20);

            // 'value' resolves to scalar
            const resolved = group!.getDataValue('v', 'value');
            expect(resolved).toBe(20);
            expect(typeof resolved).toBe('number');
        });

        test('from: value resolves count agg object to scalar (committed data)', async () => {
            const api = await gridsManager.createGridAndWait('from-value-count', {
                columnDefs: [
                    { field: 'cat', rowGroup: true, hide: true },
                    { field: 'v', aggFunc: 'count' },
                ],
                rowData: [
                    { id: '1', cat: 'A', v: 'x' },
                    { id: '2', cat: 'A', v: 'y' },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: 1,
            });
            await asyncSetTimeout(1);

            let group: any;
            api.forEachNode((node: any) => {
                if (node.group && node.key === 'A') {
                    group = node;
                }
            });

            // 'data' returns count wrapper
            const rawVal = group!.getDataValue('v', 'data');
            expect(typeof rawVal).toBe('object');
            expect(rawVal.value).toBe(2);

            // 'value' resolves to scalar
            expect(group!.getDataValue('v', 'value')).toBe(2);
        });

        test('from: value on leaf row returns same as data', async () => {
            const api = await gridsManager.createGridAndWait('from-value-leaf', {
                columnDefs: [{ field: 'v' }],
                rowData: [{ id: '1', v: 42 }],
                getRowId: (params) => params.data.id,
            });

            const row = api.getRowNode('1')!;
            expect(row.getDataValue('v', 'value')).toBe(42);
            expect(row.getDataValue('v', 'data')).toBe(42);
        });

        test('from: value ignores pending batch edits', async () => {
            const api = await gridsManager.createGridAndWait('from-value-batch', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
                rowData: [{ id: '0', a: 'original' }],
                getRowId: (params) => params.data.id,
            });

            api.startBatchEdit();
            const rowNode = api.getRowNode('0')!;
            rowNode.setDataValue('a', 'pending', 'batch');

            // 'value' reads committed data (not pending)
            expect(rowNode.getDataValue('a', 'value')).toBe('original');

            // 'batch' reads pending
            expect(rowNode.getDataValue('a', 'batch')).toBe('pending');

            api.cancelBatchEdit();
        });

        test('from: value does not resolve non-agg column objects with toNumber', async () => {
            const api = await gridsManager.createGridAndWait('from-value-non-agg', {
                columnDefs: [
                    {
                        colId: 'measurement',
                        valueGetter: (params) => ({
                            value: params.data.v,
                            toNumber() {
                                return params.data.v;
                            },
                        }),
                    },
                ],
                rowData: [{ id: '1', v: 42 }],
                getRowId: (params) => params.data.id,
            });

            const row = api.getRowNode('1')!;
            const val = row.getDataValue('measurement', 'value');

            // No aggFunc on this column, so the object is preserved (not resolved)
            expect(typeof val).toBe('object');
            expect(val.value).toBe(42);
            expect(val.toNumber()).toBe(42);
        });

        test('from: value resolves custom aggFunc object via .value fallback (no toNumber)', async () => {
            const api = await gridsManager.createGridAndWait('from-value-fallback', {
                columnDefs: [
                    { field: 'cat', rowGroup: true, hide: true },
                    {
                        field: 'v',
                        aggFunc: (params) => {
                            let sum = 0;
                            for (const v of params.values) {
                                sum +=
                                    typeof v === 'number'
                                        ? v
                                        : typeof v === 'object' && v && 'value' in v
                                          ? v.value
                                          : 0;
                            }
                            return { value: sum, label: `total=${sum}` };
                        },
                    },
                ],
                rowData: [
                    { id: '1', cat: 'A', v: 100 },
                    { id: '2', cat: 'A', v: 200 },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: 1,
            });
            await asyncSetTimeout(1);

            let group: any;
            api.forEachNode((node: any) => {
                if (node.group && node.key === 'A') {
                    group = node;
                }
            });

            // 'data' returns the raw custom object
            const rawVal = group!.getDataValue('v', 'data');
            expect(typeof rawVal).toBe('object');
            expect(rawVal.value).toBe(300);
            expect(rawVal.label).toBe('total=300');

            // 'value' resolves via .value fallback (no toNumber on this object)
            expect(group!.getDataValue('v', 'value')).toBe(300);
            expect(group!.getDataValue('v', 'edit')).toBe(300);
        });

        test('from: data-raw on group row bypasses aggregation, returns undefined', async () => {
            const api = await gridsManager.createGridAndWait('from-data-raw-group', {
                columnDefs: [
                    { field: 'cat', rowGroup: true, hide: true },
                    { field: 'v', aggFunc: 'avg' },
                ],
                rowData: [
                    { id: '1', cat: 'A', v: 10 },
                    { id: '2', cat: 'A', v: 30 },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: 1,
            });
            await asyncSetTimeout(1);

            let group: any;
            api.forEachNode((node: any) => {
                if (node.group && node.key === 'A') {
                    group = node;
                }
            });

            // 'data' returns the agg wrapper
            const dataVal = group!.getDataValue('v', 'data');
            expect(typeof dataVal).toBe('object');
            expect(dataVal.value).toBe(20);

            // 'data-raw' bypasses aggregation — group rows have no rowNode.data, so returns undefined
            const rawVal = group!.getDataValue('v', 'data-raw');
            expect(rawVal).toBeUndefined();
        });

        test('from: data-raw on leaf row returns same value as data', async () => {
            const api = await gridsManager.createGridAndWait('from-data-raw-leaf', {
                columnDefs: [{ field: 'v' }],
                rowData: [{ id: '1', v: 42 }],
                getRowId: (params) => params.data.id,
            });

            const row = api.getRowNode('1')!;
            // On leaf rows there's no aggregation, so data-raw returns the same as data
            expect(row.getDataValue('v', 'data-raw')).toBe(42);
            expect(row.getDataValue('v', 'data')).toBe(42);
        });

        test('from: data-raw on tree data parent bypasses aggregation', async () => {
            const api = await gridsManager.createGridAndWait('from-data-raw-tree', {
                columnDefs: [{ field: 'name' }, { field: 'v', aggFunc: 'sum' }],
                treeData: true,
                treeDataChildrenField: 'children',
                rowData: [
                    {
                        id: '1',
                        name: 'Parent',
                        v: 5,
                        children: [
                            { id: '1-1', name: 'Child 1', v: 20 },
                            { id: '1-2', name: 'Child 2', v: 30 },
                        ],
                    },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: -1,
            });
            await asyncSetTimeout(1);

            const parent = api.getRowNode('1')!;

            // 'data' returns aggregated value (sum of children)
            expect(parent.getDataValue('v', 'data')).toBe(50);

            // 'data-raw' bypasses aggregation — returns the parent's own data value
            expect(parent.getDataValue('v', 'data-raw')).toBe(5);
        });
    });

    describe('from parameter with valueGetter', () => {
        test('from: all modes call valueGetter on leaf rows', async () => {
            const api = await gridsManager.createGridAndWait('from-vg-all-modes', {
                columnDefs: [
                    { field: 'price' },
                    { field: 'quantity' },
                    {
                        colId: 'total',
                        valueGetter: (params) => params.data.price * params.data.quantity,
                    },
                ],
                rowData: [{ id: '1', price: 10, quantity: 5 }],
                getRowId: (params) => params.data.id,
            });

            const row = api.getRowNode('1')!;

            // All from modes call the valueGetter — there is no aggregation or pending edit on a plain leaf row
            expect(row.getDataValue('total')).toBe(50);
            expect(row.getDataValue('total', 'data')).toBe(50);
            expect(row.getDataValue('total', 'data-raw')).toBe(50);
            expect(row.getDataValue('total', 'edit')).toBe(50);
            expect(row.getDataValue('total', 'batch')).toBe(50);
            expect(row.getDataValue('total', 'value')).toBe(50);
        });

        test('from: data-raw calls valueGetter (skips aggData, not valueGetters)', async () => {
            // data-raw only bypasses rowNode.aggData (aggregation results).
            // valueGetters are still executed — they read from rowNode.data directly.
            const api = await gridsManager.createGridAndWait('from-vg-data-raw', {
                columnDefs: [
                    { field: 'cat', rowGroup: true, hide: true },
                    { field: 'v', aggFunc: 'sum' },
                    {
                        colId: 'label',
                        // valueGetter that reads from the leaf row data
                        valueGetter: (params) => (params.data ? `item-${params.data.v}` : null),
                    },
                ],
                rowData: [
                    { id: '1', cat: 'A', v: 10 },
                    { id: '2', cat: 'A', v: 20 },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: 1,
            });

            await asyncSetTimeout(1);

            // Leaf row: data-raw still calls the valueGetter
            const leaf = api.getRowNode('1')!;
            expect(leaf.group).toBe(false);
            expect(leaf.getDataValue('label', 'data')).toBe('item-10');
            expect(leaf.getDataValue('label', 'data-raw')).toBe('item-10');

            // Group row: data-raw skips aggData then calls valueGetter.
            // Group rows have no data, so valueGetter returns null.
            let group: any;
            api.forEachNode((node: any) => {
                if (node.group && node.key === 'A') {
                    group = node;
                }
            });
            expect(group!.getDataValue('label', 'data-raw')).toBeNull();
            expect(group!.getDataValue('label', 'data')).toBeNull();
        });

        test('from: batch returns pending value for field column; valueGetter always reads committed data', async () => {
            const api = await gridsManager.createGridAndWait('from-vg-batch-pending', {
                columnDefs: [
                    { field: 'price', editable: true },
                    { field: 'quantity' },
                    {
                        colId: 'total',
                        valueGetter: (params) => params.data.price * params.data.quantity,
                    },
                ],
                rowData: [{ id: '1', price: 10, quantity: 5 }],
                getRowId: (params) => params.data.id,
            });

            api.startBatchEdit();
            const row = api.getRowNode('1')!;
            row.setDataValue('price', 20, 'batch');

            // 'data' returns committed price; 'batch' returns the pending value
            expect(row.getDataValue('price', 'data')).toBe(10);
            expect(row.getDataValue('price', 'batch')).toBe(20);

            // valueGetter reads from params.data which holds committed data,
            // so 'total' returns committed result for all modes
            expect(row.getDataValue('total', 'data')).toBe(50); // 10 * 5
            expect(row.getDataValue('total', 'batch')).toBe(50); // still 10 * 5 (valueGetter sees committed data)

            api.cancelBatchEdit();
        });
    });

    describe('showRowGroup columns', () => {
        test('getDataValue returns null if display-level showRowGroup check fails', async () => {
            const api = await gridsManager.createGridAndWait('showRowGroup-basic', {
                columnDefs: [
                    {
                        colId: 'countryGroupCol',
                        showRowGroup: 'country',
                        cellRenderer: 'agGroupCellRenderer',
                    },
                    {
                        colId: 'athleteGroupCol',
                        showRowGroup: 'athlete',
                        cellRenderer: 'agGroupCellRenderer',
                    },
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'athlete', rowGroup: true, hide: true },
                    { field: 'gold', aggFunc: 'sum' },
                ],
                groupDisplayType: 'custom',
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
                rowData: [
                    { id: '1', country: 'USA', athlete: 'Michael', gold: 8 },
                    { id: '2', country: 'USA', athlete: 'Ryan', gold: 2 },
                ],
            });
            await asyncSetTimeout(1);

            // Country group node (level 0)
            const countryGroup = api.getRowNode('row-group-country-USA')!;
            expect(countryGroup.group).toBe(true);
            expect(countryGroup.level).toBe(0);

            // Athlete group node (level 1)
            const athleteGroup = api.getRowNode('row-group-country-USA-athlete-Michael')!;
            expect(athleteGroup.group).toBe(true);
            expect(athleteGroup.level).toBe(1);

            // Group key is returned from groupData at matching level
            expect(countryGroup.getDataValue('countryGroupCol')).toBe('USA');
            expect(athleteGroup.getDataValue('athleteGroupCol')).toBe('Michael');

            // At non-matching levels, groupData has no entry for the column — returns undefined.
            // countryGroup (level 0) on athleteGroupCol (showRowGroup:'athlete', index 1): null for retro-compatibility
            expect(countryGroup.getDataValue('athleteGroupCol')).toBeNull();
            // athleteGroup (level 1) on countryGroupCol (showRowGroup:'country', index 0): level check doesn't trigger
            expect(athleteGroup.getDataValue('countryGroupCol')).toBeUndefined();

            // Aggregated gold values work on both levels
            expect(countryGroup.getDataValue('gold')).toBe(10);
            expect(athleteGroup.getDataValue('gold')).toBe(8);
        });

        test('getDataValue returns edited value on group row after setDataValue with enableGroupEdit', async () => {
            const api = await gridsManager.createGridAndWait('showRowGroup-enableGroupEdit', {
                columnDefs: [
                    {
                        colId: 'countryGroupCol',
                        showRowGroup: 'country',
                        cellRenderer: 'agGroupCellRenderer',
                    },
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'gold', aggFunc: 'sum' },
                    { field: 'notes', editable: true },
                ],
                groupDisplayType: 'custom',
                enableGroupEdit: true,
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
                rowData: [
                    { id: '1', country: 'USA', gold: 8, notes: 'leaf note' },
                    { id: '2', country: 'USA', gold: 2, notes: '' },
                ],
            });
            await asyncSetTimeout(1);

            const countryGroup = api.getRowNode('row-group-country-USA')!;
            expect(countryGroup.group).toBe(true);
            expect(countryGroup.data).toBeUndefined();

            // Before editing, 'notes' has no value on the group row
            expect(countryGroup.getDataValue('notes')).toBeUndefined();

            // setDataValue creates rowNode.data on the group row and sets the value
            countryGroup.setDataValue('notes', 'group note');

            expect(countryGroup.data).toBeDefined();
            expect(countryGroup.getDataValue('notes')).toBe('group note');

            // groupData still drives the showRowGroup column
            expect(countryGroup.getDataValue('countryGroupCol')).toBe('USA');

            // Aggregated gold values still work
            expect(countryGroup.getDataValue('gold')).toBe(10);
        });

        test('tree data group rows resolve showRowGroup columns from their own data', async () => {
            const api = await gridsManager.createGridAndWait('showRowGroup-treeData', {
                columnDefs: [
                    {
                        colId: 'regionGroupCol',
                        showRowGroup: true,
                        cellRenderer: 'agGroupCellRenderer',
                    },
                    { field: 'name' },
                    { field: 'region' },
                    { field: 'value', aggFunc: 'sum' },
                ],
                treeData: true,
                treeDataChildrenField: 'children',
                groupDefaultExpanded: -1,
                rowData: [
                    {
                        id: '1',
                        name: 'Parent',
                        region: 'North',
                        value: 5,
                        children: [
                            { id: '2', name: 'Child1', region: 'East', value: 20 },
                            { id: '3', name: 'Child2', region: 'West', value: 30 },
                        ],
                    },
                ],
                getRowId: ({ data }) => data.id,
            });
            await asyncSetTimeout(1);

            const parent = api.getRowNode('1')!;
            expect(parent.group).toBe(true);
            // Tree data group rows have their own data
            expect(parent.data).toBeDefined();

            // Field values come from the row's own data
            expect(parent.getDataValue('name')).toBe('Parent');
            expect(parent.getDataValue('region')).toBe('North');

            // Aggregated value
            expect(parent.getDataValue('value')).toBe(50);

            // data-raw bypasses aggregation and returns the row's own data
            expect(parent.getDataValue('value', 'data-raw')).toBe(5);

            // Child row
            const child = api.getRowNode('2')!;
            expect(child.getDataValue('name')).toBe('Child1');
            expect(child.getDataValue('region')).toBe('East');
            expect(child.getDataValue('value')).toBe(20);
        });
    });
});
