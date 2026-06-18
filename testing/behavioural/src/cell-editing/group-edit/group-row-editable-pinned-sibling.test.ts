import type { GridOptions, GroupRowValueSetterParams, RowNode, ValueSetterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    NumberEditorModule,
    NumberFilterModule,
    PinnedRowModule,
    TextEditorModule,
    UndoRedoEditModule,
} from 'ag-grid-community';
import { PivotModule, RowGroupingEditModule, RowGroupingModule, SetFilterModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../../test-utils';
import { EDIT_MODES, cascadeGroupRowValueSetter, editCell } from './group-edit-test-utils';

/**
 * Tests for editing cells in manually pinned rows (pinnedSibling).
 * When a row is manually pinned, it creates a pinned copy that shares data with the source row.
 * Edits to either the pinned or source row should update both.
 */
describe('editing with pinned sibling rows', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            RowGroupingEditModule,
            NumberEditorModule,
            TextEditorModule,
            NumberFilterModule,
            ClientSideRowModelModule,
            RowGroupingModule,
            PivotModule,
            UndoRedoEditModule,
            PinnedRowModule,
            SetFilterModule,
        ],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    function createRowData() {
        return [
            { id: '1', region: 'Europe', country: 'France', year: 2020, sales: 1000 },
            { id: '2', region: 'Europe', country: 'France', year: 2021, sales: 1200 },
            { id: '3', region: 'Europe', country: 'Germany', year: 2020, sales: 1500 },
            { id: '4', region: 'Europe', country: 'Germany', year: 2021, sales: 1800 },
            { id: '5', region: 'Americas', country: 'USA', year: 2020, sales: 2000 },
            { id: '6', region: 'Americas', country: 'USA', year: 2021, sales: 2200 },
        ];
    }

    describe('manual row pinning with non-pivot mode', () => {
        function createSimpleGridOptions(overrides: Partial<GridOptions> = {}): GridOptions {
            return {
                defaultColDef: {
                    cellEditor: 'agTextCellEditor',
                    editable: true,
                },
                undoRedoCellEditing: true,
                columnDefs: [{ field: 'country' }, { field: 'year' }, { field: 'sales' }, { field: 'region' }],
                getRowId: ({ data }) => data.id,
                rowData: createRowData(),
                ...overrides,
            };
        }

        describe.each(EDIT_MODES)('edit mode: %s', (editMode) => {
            test('editing pinned row updates source row data in simple grid', async () => {
                const valueSetterCalls: ValueSetterParams[] = [];
                const gridOptions = createSimpleGridOptions({
                    enableRowPinning: true,
                    isRowPinned: (params) => {
                        return params.data?.id === '1' ? 'top' : null;
                    },
                    defaultColDef: {
                        cellEditor: 'agTextCellEditor',
                        editable: true,
                        valueSetter: (params: ValueSetterParams) => {
                            valueSetterCalls.push(params);
                            if (params.colDef.field && params.data) {
                                (params.data as Record<string, unknown>)[params.colDef.field] = params.newValue;
                            }
                            return true;
                        },
                    },
                });

                const api = await gridsManager.createGridAndWait('pinned-simple-edit', gridOptions);

                const pinnedRow = api.getPinnedTopRow(0) as RowNode;
                const sourceRow = api.getRowNode('1') as RowNode;

                // Check that pinnedSibling relationship exists
                expect(pinnedRow).toBeDefined();
                expect(sourceRow).toBeDefined();
                expect(pinnedRow.pinnedSibling).toBe(sourceRow);
                expect(sourceRow.pinnedSibling).toBe(pinnedRow);
                expect(pinnedRow.data).toBe(sourceRow.data);

                // Verify initial state
                let gridRows = new GridRows(api, 'before edit');
                await gridRows.check(`
                    PINNED_TOP id:t-top-1 country:"France" year:2020 sales:1000 region:"Europe"
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:1 country:"France" year:2020 sales:1000 region:"Europe"
                    ├── LEAF id:2 country:"France" year:2021 sales:1200 region:"Europe"
                    ├── LEAF id:3 country:"Germany" year:2020 sales:1500 region:"Europe"
                    ├── LEAF id:4 country:"Germany" year:2021 sales:1800 region:"Europe"
                    ├── LEAF id:5 country:"USA" year:2020 sales:2000 region:"Americas"
                    └── LEAF id:6 country:"USA" year:2021 sales:2200 region:"Americas"
                `);

                // Edit the pinned row
                if (editMode === 'ui') {
                    // Start editing and capture mid-edit state before committing
                    api.startEditingCell({
                        rowIndex: pinnedRow.rowIndex!,
                        rowPinned: pinnedRow.rowPinned,
                        colKey: 'sales',
                    });
                    await asyncSetTimeout(0);

                    await new GridRows(api, 'during edit').check(`
                        PINNED_TOP id:t-top-1 country:"France" year:2020 sales:1000 region:"Europe"
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF 🖍️ id:1 country:"France" year:2020 sales:1000 region:"Europe"
                        ├── LEAF id:2 country:"France" year:2021 sales:1200 region:"Europe"
                        ├── LEAF id:3 country:"Germany" year:2020 sales:1500 region:"Europe"
                        ├── LEAF id:4 country:"Germany" year:2021 sales:1800 region:"Europe"
                        ├── LEAF id:5 country:"USA" year:2020 sales:2000 region:"Americas"
                        └── LEAF id:6 country:"USA" year:2021 sales:2200 region:"Americas"
                    `);

                    api.stopEditing(true);
                    await asyncSetTimeout(0);

                    await editCell(api, pinnedRow, 'sales', '9999');
                } else {
                    pinnedRow.setDataValue('sales', 9999, 'ui');
                    await asyncSetTimeout(0);
                }
                await asyncSetTimeout(50);

                // Both should have the updated value
                expect(pinnedRow.data?.sales).toBe(9999);
                expect(sourceRow.data?.sales).toBe(9999);

                // Verify grid state - both pinned and source row should show updated value
                gridRows = new GridRows(api, 'after edit');
                await gridRows.check(`
                    PINNED_TOP id:t-top-1 country:"France" year:2020 sales:9999 region:"Europe"
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:1 country:"France" year:2020 sales:9999 region:"Europe"
                    ├── LEAF id:2 country:"France" year:2021 sales:1200 region:"Europe"
                    ├── LEAF id:3 country:"Germany" year:2020 sales:1500 region:"Europe"
                    ├── LEAF id:4 country:"Germany" year:2021 sales:1800 region:"Europe"
                    ├── LEAF id:5 country:"USA" year:2020 sales:2000 region:"Americas"
                    └── LEAF id:6 country:"USA" year:2021 sales:2200 region:"Americas"
                `);

                // valueSetter should have been called once (for the pinned row edit)
                expect(valueSetterCalls.length).toBe(1);

                await new GridColumns(api, 'columns').checkColumns(`
                    CENTER
                    ├── country "Country" width:200 editable
                    ├── year "Year" width:200 editable
                    ├── sales "Sales" width:200 editable
                    └── region "Region" width:200 editable
                `);
            });

            test('editing source row updates pinned sibling in simple grid', async () => {
                const gridOptions = createSimpleGridOptions({
                    enableRowPinning: true,
                    isRowPinned: (params) => {
                        return params.data?.id === '1' ? 'bottom' : null;
                    },
                });

                const api = await gridsManager.createGridAndWait('source-simple-edit', gridOptions);

                const sourceRow = api.getRowNode('1') as RowNode;
                const pinnedRow = api.getPinnedBottomRow(0) as RowNode;

                // Check pinnedSibling relationship
                expect(sourceRow).toBeDefined();
                expect(pinnedRow).toBeDefined();
                expect(sourceRow.pinnedSibling).toBe(pinnedRow);
                expect(pinnedRow.pinnedSibling).toBe(sourceRow);

                // Edit the source row
                if (editMode === 'ui') {
                    await editCell(api, sourceRow, 'sales', '1111');
                } else {
                    sourceRow.setDataValue('sales', 1111, 'ui');
                    await asyncSetTimeout(0);
                }
                await asyncSetTimeout(50);

                expect(sourceRow.data?.sales).toBe(1111);
                expect(pinnedRow.data?.sales).toBe(1111);

                // Verify grid state - both source and pinned row should show updated value
                const gridRows = new GridRows(api, 'after edit');
                await gridRows.check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:1 country:"France" year:2020 sales:1111 region:"Europe"
                    ├── LEAF id:2 country:"France" year:2021 sales:1200 region:"Europe"
                    ├── LEAF id:3 country:"Germany" year:2020 sales:1500 region:"Europe"
                    ├── LEAF id:4 country:"Germany" year:2021 sales:1800 region:"Europe"
                    ├── LEAF id:5 country:"USA" year:2020 sales:2000 region:"Americas"
                    └── LEAF id:6 country:"USA" year:2021 sales:2200 region:"Americas"
                    PINNED_BOTTOM id:b-bottom-1 country:"France" year:2020 sales:1111 region:"Europe"
                `);

                await new GridColumns(api, 'columns').checkColumns(`
                    CENTER
                    ├── country "Country" width:200 editable
                    ├── year "Year" width:200 editable
                    ├── sales "Sales" width:200 editable
                    └── region "Region" width:200 editable
                `);
            });
        });
    });

    describe('group row pinned sibling with groupRowValueSetter', () => {
        function createGroupRowData() {
            return [
                { id: 'fr-paris', region: 'Europe', country: 'France', amount: 100 },
                { id: 'fr-lyon', region: 'Europe', country: 'France', amount: 200 },
                { id: 'de-berlin', region: 'Europe', country: 'Germany', amount: 150 },
                { id: 'de-hamburg', region: 'Europe', country: 'Germany', amount: 250 },
            ];
        }

        describe.each(EDIT_MODES)('edit mode: %s', (editMode) => {
            test('editing pinned group row cascades to children via groupRowValueSetter', async () => {
                // Use isRowPinned callback to pin the France group
                const api = await gridsManager.createGridAndWait('pinned-group-edit', {
                    defaultColDef: {
                        cellEditor: 'agTextCellEditor',
                    },
                    undoRedoCellEditing: true,
                    enableRowPinning: true,
                    isRowPinned: (node) => {
                        // Pin the France group row to top
                        return node.key === 'France' && node.group ? 'top' : null;
                    },
                    groupDisplayType: 'custom',
                    columnDefs: [
                        {
                            colId: 'group',
                            headerName: 'Group',
                            cellRenderer: 'agGroupCellRenderer',
                        },
                        { field: 'country', rowGroup: true, hide: true },
                        {
                            colId: 'amount',
                            field: 'amount',
                            aggFunc: 'sum',
                            editable: true,
                            groupRowEditable: true,
                            groupRowValueSetter: cascadeGroupRowValueSetter,
                        },
                    ],
                    rowData: createGroupRowData(),
                    groupDefaultExpanded: -1,
                    getRowId: (params) => params.data?.id,
                });

                // Get the France group row and the pinned version
                const franceGroup = api.getRowNode('row-group-country-France') as RowNode;
                expect(franceGroup).toBeDefined();
                expect(franceGroup.group).toBe(true);
                expect(franceGroup.aggData?.amount).toBe(300); // 100 + 200

                // Get the pinned group row
                const pinnedGroup = api.getPinnedTopRow(0) as RowNode;
                expect(pinnedGroup).toBeDefined();
                expect(pinnedGroup.group).toBe(true);
                expect(pinnedGroup.pinnedSibling).toBe(franceGroup);
                expect(franceGroup.pinnedSibling).toBe(pinnedGroup);

                let gridRows = new GridRows(api, 'before edit');
                await gridRows.check(`
                    PINNED_TOP id:t-top-row-group-country-France amount:300
                    ROOT id:ROOT_NODE_ID
                    ├─┬ LEAF_GROUP id:row-group-country-France amount:300
                    │ ├── LEAF id:fr-paris country:"France" amount:100
                    │ └── LEAF id:fr-lyon country:"France" amount:200
                    └─┬ LEAF_GROUP id:row-group-country-Germany amount:400
                    · ├── LEAF id:de-berlin country:"Germany" amount:150
                    · └── LEAF id:de-hamburg country:"Germany" amount:250
                `);

                // Edit the pinned group row - should cascade to children
                if (editMode === 'ui') {
                    await editCell(api, pinnedGroup, 'amount', '600');
                } else {
                    pinnedGroup.setDataValue('amount', 600, 'ui');
                    await asyncSetTimeout(0);
                }
                await asyncSetTimeout(50);

                // Verify the edit cascaded to children (600 / 2 = 300 each)
                expect(api.getRowNode('fr-paris')?.data?.amount).toBe(300);
                expect(api.getRowNode('fr-lyon')?.data?.amount).toBe(300);

                // Verify aggregations updated
                expect(franceGroup.aggData?.amount).toBe(600);
                expect(pinnedGroup.aggData?.amount).toBe(600);

                // Verify grid state
                gridRows = new GridRows(api, 'after edit');
                await gridRows.check(`
                    PINNED_TOP id:t-top-row-group-country-France amount:600
                    ROOT id:ROOT_NODE_ID
                    ├─┬ LEAF_GROUP id:row-group-country-France amount:600
                    │ ├── LEAF id:fr-paris country:"France" amount:300
                    │ └── LEAF id:fr-lyon country:"France" amount:300
                    └─┬ LEAF_GROUP id:row-group-country-Germany amount:400
                    · ├── LEAF id:de-berlin country:"Germany" amount:150
                    · └── LEAF id:de-hamburg country:"Germany" amount:250
                `);

                await new GridColumns(api, 'columns').checkColumns(`
                    CENTER
                    ├── group "Group" width:200
                    └── amount "Amount" width:200 aggFunc:sum editable
                `);
            });

            test('editing source group row updates pinned sibling aggregation', async () => {
                // Use isRowPinned callback to pin the France group to bottom
                const api = await gridsManager.createGridAndWait('source-group-edit', {
                    defaultColDef: {
                        cellEditor: 'agTextCellEditor',
                    },
                    undoRedoCellEditing: true,
                    enableRowPinning: true,
                    isRowPinned: (node) => {
                        return node.key === 'France' && node.group ? 'bottom' : null;
                    },
                    groupDisplayType: 'custom',
                    columnDefs: [
                        {
                            colId: 'group',
                            headerName: 'Group',
                            cellRenderer: 'agGroupCellRenderer',
                        },
                        { field: 'country', rowGroup: true, hide: true },
                        {
                            colId: 'amount',
                            field: 'amount',
                            aggFunc: 'sum',
                            editable: true,
                            groupRowEditable: true,
                            groupRowValueSetter: cascadeGroupRowValueSetter,
                        },
                    ],
                    rowData: createGroupRowData(),
                    groupDefaultExpanded: -1,
                    getRowId: (params) => params.data?.id,
                });

                // Get the France group row
                const franceGroup = api.getRowNode('row-group-country-France') as RowNode;
                expect(franceGroup).toBeDefined();

                const pinnedGroup = api.getPinnedBottomRow(0) as RowNode;
                expect(pinnedGroup).toBeDefined();
                expect(pinnedGroup.pinnedSibling).toBe(franceGroup);

                // Edit the SOURCE group row (not the pinned one)
                if (editMode === 'ui') {
                    await editCell(api, franceGroup, 'amount', '400');
                } else {
                    franceGroup.setDataValue('amount', 400, 'ui');
                    await asyncSetTimeout(0);
                }
                await asyncSetTimeout(50);

                // Verify the edit cascaded to children (400 / 2 = 200 each)
                expect(api.getRowNode('fr-paris')?.data?.amount).toBe(200);
                expect(api.getRowNode('fr-lyon')?.data?.amount).toBe(200);

                // Verify both source and pinned group have updated aggregation
                expect(franceGroup.aggData?.amount).toBe(400);
                expect(pinnedGroup.aggData?.amount).toBe(400);

                const gridRows = new GridRows(api, 'after edit');
                await gridRows.check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ LEAF_GROUP id:row-group-country-France amount:400
                    │ ├── LEAF id:fr-paris country:"France" amount:200
                    │ └── LEAF id:fr-lyon country:"France" amount:200
                    └─┬ LEAF_GROUP id:row-group-country-Germany amount:400
                    · ├── LEAF id:de-berlin country:"Germany" amount:150
                    · └── LEAF id:de-hamburg country:"Germany" amount:250
                    PINNED_BOTTOM id:b-bottom-row-group-country-France amount:400
                `);
            });
        });
    });

    describe('aggregatedChildren in groupRowValueSetter callback', () => {
        function createGroupRowDataForCallback() {
            return [
                { id: 'fr-paris', region: 'Europe', country: 'France', amount: 100 },
                { id: 'fr-lyon', region: 'Europe', country: 'France', amount: 200 },
                { id: 'de-berlin', region: 'Europe', country: 'Germany', amount: 150 },
                { id: 'de-hamburg', region: 'Europe', country: 'Germany', amount: 250 },
            ];
        }

        describe.each(EDIT_MODES)('edit mode: %s', (editMode) => {
            test('aggregatedChildren contains correct children when editing pinned group row', async () => {
                const capturedParams: GroupRowValueSetterParams[] = [];

                const customValueSetter = (params: GroupRowValueSetterParams) => {
                    capturedParams.push(params);
                    cascadeGroupRowValueSetter(params);
                };

                const api = await gridsManager.createGridAndWait('pinned-agg-children', {
                    defaultColDef: { cellEditor: 'agTextCellEditor' },
                    undoRedoCellEditing: true,
                    enableRowPinning: true,
                    isRowPinned: (node) => (node.key === 'France' && node.group ? 'top' : null),
                    groupDisplayType: 'custom',
                    columnDefs: [
                        { colId: 'group', headerName: 'Group', cellRenderer: 'agGroupCellRenderer' },
                        { field: 'country', rowGroup: true, hide: true },
                        {
                            colId: 'amount',
                            field: 'amount',
                            aggFunc: 'sum',
                            editable: true,
                            groupRowEditable: true,
                            groupRowValueSetter: customValueSetter,
                        },
                    ],
                    rowData: createGroupRowDataForCallback(),
                    groupDefaultExpanded: -1,
                    getRowId: (params) => params.data?.id,
                });

                const pinnedGroup = api.getPinnedTopRow(0) as RowNode;
                expect(pinnedGroup).toBeDefined();

                // Edit the pinned group row
                if (editMode === 'ui') {
                    await editCell(api, pinnedGroup, 'amount', '600');
                } else {
                    pinnedGroup.setDataValue('amount', 600, 'ui');
                    await asyncSetTimeout(0);
                }
                await asyncSetTimeout(50);

                // Verify the callback was called with correct aggregatedChildren
                expect(capturedParams.length).toBe(1);
                const params = capturedParams[0];

                // aggregatedChildren should contain the France group's leaf children
                expect(params.aggregatedChildren.length).toBe(2);
                expect(params.aggregatedChildren.map((n) => n.id).sort()).toEqual(['fr-lyon', 'fr-paris']);

                // The node in the callback should be the PINNED row (the row being edited)
                // This is correct - the callback gets the actual edited node
                expect(params.node.rowPinned).toBe('top');
            });

            test('aggregatedChildren reflects filtering when editing pinned group row', async () => {
                const capturedParams: GroupRowValueSetterParams[] = [];

                const customValueSetter = (params: GroupRowValueSetterParams) => {
                    capturedParams.push(params);
                    cascadeGroupRowValueSetter(params);
                };

                const api = await gridsManager.createGridAndWait('pinned-agg-children-filter', {
                    defaultColDef: { cellEditor: 'agTextCellEditor' },
                    undoRedoCellEditing: true,
                    enableRowPinning: true,
                    isRowPinned: (node) => (node.key === 'France' && node.group ? 'top' : null),
                    groupDisplayType: 'custom',
                    columnDefs: [
                        { colId: 'group', headerName: 'Group', cellRenderer: 'agGroupCellRenderer' },
                        { field: 'country', rowGroup: true, hide: true },
                        {
                            colId: 'amount',
                            field: 'amount',
                            aggFunc: 'sum',
                            editable: true,
                            groupRowEditable: true,
                            groupRowValueSetter: customValueSetter,
                            filter: 'agNumberColumnFilter',
                        },
                    ],
                    rowData: createGroupRowDataForCallback(),
                    groupDefaultExpanded: -1,
                    getRowId: (params) => params.data?.id,
                });

                // Apply filter to show only rows with amount >= 150
                await api.setColumnFilterModel('amount', {
                    filterType: 'number',
                    type: 'greaterThanOrEqual',
                    filter: 150,
                });
                api.onFilterChanged();

                const pinnedGroup = api.getPinnedTopRow(0) as RowNode;
                expect(pinnedGroup).toBeDefined();
                // France group should now only aggregate fr-lyon (200 >= 150)
                expect(pinnedGroup.aggData?.amount).toBe(200);

                // Edit the pinned group row
                if (editMode === 'ui') {
                    await editCell(api, pinnedGroup, 'amount', '400');
                } else {
                    pinnedGroup.setDataValue('amount', 400, 'ui');
                    await asyncSetTimeout(0);
                }
                await asyncSetTimeout(50);

                // Verify the callback was called with filtered aggregatedChildren
                expect(capturedParams.length).toBe(1);
                const params = capturedParams[0];

                // aggregatedChildren should only contain the filtered child (fr-lyon)
                expect(params.aggregatedChildren.length).toBe(1);
                expect(params.aggregatedChildren[0].id).toBe('fr-lyon');
            });

            test('aggregatedChildren contains correct children for pinned filler group (multi-level)', async () => {
                const capturedParams: GroupRowValueSetterParams[] = [];

                const customValueSetter = (params: GroupRowValueSetterParams) => {
                    capturedParams.push(params);
                    cascadeGroupRowValueSetter(params);
                };

                const api = await gridsManager.createGridAndWait('pinned-filler-agg-children', {
                    defaultColDef: { cellEditor: 'agTextCellEditor' },
                    undoRedoCellEditing: true,
                    enableRowPinning: true,
                    isRowPinned: (node) => (node.key === 'Europe' && node.level === 0 ? 'top' : null),
                    groupDisplayType: 'custom',
                    columnDefs: [
                        { colId: 'group', headerName: 'Group', cellRenderer: 'agGroupCellRenderer' },
                        { field: 'region', rowGroup: true, hide: true },
                        { field: 'country', rowGroup: true, hide: true },
                        {
                            colId: 'amount',
                            field: 'amount',
                            aggFunc: 'sum',
                            editable: true,
                            groupRowEditable: true,
                            groupRowValueSetter: customValueSetter,
                        },
                    ],
                    rowData: createGroupRowDataForCallback(),
                    groupDefaultExpanded: -1,
                    getRowId: (params) => params.data?.id,
                });

                const pinnedEurope = api.getPinnedTopRow(0) as RowNode;
                expect(pinnedEurope).toBeDefined();
                expect(pinnedEurope.key).toBe('Europe');
                // Europe should aggregate France (300) + Germany (400) = 700
                expect(pinnedEurope.aggData?.amount).toBe(700);

                // Edit the pinned filler group row
                if (editMode === 'ui') {
                    await editCell(api, pinnedEurope, 'amount', '1400');
                } else {
                    pinnedEurope.setDataValue('amount', 1400, 'ui');
                    await asyncSetTimeout(0);
                }
                await asyncSetTimeout(50);

                // Verify the callback was called with correct aggregatedChildren
                // For a filler group, children are the country groups (France, Germany)
                expect(capturedParams.length).toBeGreaterThanOrEqual(1);
                const europeParams = capturedParams[0];

                // aggregatedChildren should contain the Europe group's direct children (country groups)
                expect(europeParams.aggregatedChildren.length).toBe(2);
                expect(europeParams.aggregatedChildren.every((n) => n.group)).toBe(true);
                expect(europeParams.aggregatedChildren.map((n) => n.key).sort()).toEqual(['France', 'Germany']);
            });
        });
    });

    describe('getAggregatedChildren on pinned rows', () => {
        function createGroupRowDataForAggChildren() {
            return [
                { id: 'fr-paris', region: 'Europe', country: 'France', amount: 100 },
                { id: 'fr-lyon', region: 'Europe', country: 'France', amount: 200 },
                { id: 'de-berlin', region: 'Europe', country: 'Germany', amount: 150 },
            ];
        }

        test('getAggregatedChildren on pinned group returns same children as source', async () => {
            const api = await gridsManager.createGridAndWait('pinned-get-agg-children', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'amount', aggFunc: 'sum' },
                ],
                enableRowPinning: true,
                isRowPinned: (node) => (node.key === 'France' && node.group ? 'top' : null),
                rowData: createGroupRowDataForAggChildren(),
                groupDefaultExpanded: -1,
                getRowId: (params) => params.data?.id,
            });
            await new GridColumns(api, `getAggregatedChildren on pinned group returns same children as source setup`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    └── amount "Amount" width:200 aggFunc:sum
                `);
            await new GridRows(api, `getAggregatedChildren on pinned group returns same children as source setup`)
                .check(`
                    PINNED_TOP id:t-top-row-group-country-France ag-Grid-AutoColumn:"France" amount:300
                    ROOT id:ROOT_NODE_ID
                    ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:300
                    │ ├── LEAF id:fr-paris country:"France" amount:100
                    │ └── LEAF id:fr-lyon country:"France" amount:200
                    └─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:150
                    · └── LEAF id:de-berlin country:"Germany" amount:150
                `);

            const sourceGroup = api.getRowNode('row-group-country-France');
            const pinnedGroup = api.getPinnedTopRow(0);

            expect(sourceGroup).toBeDefined();
            expect(pinnedGroup).toBeDefined();

            // Both should return the same children
            const sourceChildren = sourceGroup!.getAggregatedChildren('amount');
            const pinnedChildren = pinnedGroup!.getAggregatedChildren('amount');

            expect(sourceChildren.length).toBe(2);
            expect(pinnedChildren.length).toBe(2);
            expect(sourceChildren.map((n) => n.id).sort()).toEqual(['fr-lyon', 'fr-paris']);
            expect(pinnedChildren.map((n) => n.id).sort()).toEqual(['fr-lyon', 'fr-paris']);
            await new GridRows(api, `getAggregatedChildren on pinned group returns same children as source final state`)
                .check(`
                    PINNED_TOP id:t-top-row-group-country-France ag-Grid-AutoColumn:"France" amount:300
                    ROOT id:ROOT_NODE_ID
                    ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:300
                    │ ├── LEAF id:fr-paris country:"France" amount:100
                    │ └── LEAF id:fr-lyon country:"France" amount:200
                    └─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:150
                    · └── LEAF id:de-berlin country:"Germany" amount:150
                `);
        });

        test('getAggregatedChildren on pinned group reflects filtering', async () => {
            const api = await gridsManager.createGridAndWait('pinned-get-agg-children-filter', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'amount', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
                ],
                enableRowPinning: true,
                isRowPinned: (node) => (node.key === 'France' && node.group ? 'top' : null),
                rowData: createGroupRowDataForAggChildren(),
                groupDefaultExpanded: -1,
                getRowId: (params) => params.data?.id,
            });
            await new GridColumns(api, `getAggregatedChildren on pinned group reflects filtering setup`).checkColumns(
                `
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    └── amount "Amount" width:200 aggFunc:sum
                `
            );
            await new GridRows(api, `getAggregatedChildren on pinned group reflects filtering setup`).check(`
                PINNED_TOP id:t-top-row-group-country-France ag-Grid-AutoColumn:"France" amount:300
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:300
                │ ├── LEAF id:fr-paris country:"France" amount:100
                │ └── LEAF id:fr-lyon country:"France" amount:200
                └─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:150
                · └── LEAF id:de-berlin country:"Germany" amount:150
            `);

            const pinnedGroup = api.getPinnedTopRow(0);
            expect(pinnedGroup).toBeDefined();

            // Before filter - 2 children
            let pinnedChildren = pinnedGroup!.getAggregatedChildren('amount');
            expect(pinnedChildren.length).toBe(2);

            // Apply filter to show only amount >= 150
            await api.setColumnFilterModel('amount', {
                filterType: 'number',
                type: 'greaterThanOrEqual',
                filter: 150,
            });
            api.onFilterChanged();

            // After filter - only 1 child (fr-lyon with 200)
            pinnedChildren = pinnedGroup!.getAggregatedChildren('amount');
            expect(pinnedChildren.length).toBe(1);
            expect(pinnedChildren[0].id).toBe('fr-lyon');
            await new GridRows(api, `getAggregatedChildren on pinned group reflects filtering final state`).check(`
                PINNED_TOP id:t-top-row-group-country-France ag-Grid-AutoColumn:"France" amount:200
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" amount:200
                │ └── LEAF id:fr-lyon country:"France" amount:200
                └─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" amount:150
                · └── LEAF id:de-berlin country:"Germany" amount:150
            `);
        });
    });
});
