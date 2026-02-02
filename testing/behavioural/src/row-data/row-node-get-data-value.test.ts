import { getByTestId } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { userEvent } from '@testing-library/user-event';

import { ClientSideRowModelModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { BatchEditModule, FormulaModule, PivotModule, RowGroupingModule, TreeDataModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout, waitForInput } from '../test-utils';
import { expect } from '../test-utils/matchers';

/** Tests for RowNode.getDataValue() method (AG-16600) */
describe('RowNode.getDataValue', () => {
    const gridsManager = new TestGridsManager({
        modules: [
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
});
