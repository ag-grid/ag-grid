import type { GridOptions } from 'ag-grid-community';
import { AllCommunityModule, ClientSideRowModelModule, setupAgTestIds } from 'ag-grid-community';
import {
    BatchEditModule,
    CellSelectionModule,
    ClipboardModule,
    RowGroupingEditModule,
    RowGroupingModule,
} from 'ag-grid-enterprise';

import {
    GridColumns,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    clipboardUtils,
    waitForEvent,
} from '../../test-utils';

describe('Group Edit: clipboard paste', () => {
    const gridMgr = new TestGridsManager({
        modules: [
            AllCommunityModule,
            ClientSideRowModelModule,
            CellSelectionModule,
            RowGroupingEditModule,
            RowGroupingModule,
            ClipboardModule,
            BatchEditModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
        clipboardUtils.init();
    });

    beforeEach(() => {
        clipboardUtils.init();
    });

    afterEach(() => {
        gridMgr.reset();
        clipboardUtils.reset();
    });

    test('paste on group row with groupRowEditable cascades to all children', async () => {
        const gridOptions: GridOptions = {
            groupDisplayType: 'custom',
            defaultColDef: {
                cellEditor: 'agTextCellEditor',
            },
            columnDefs: [
                {
                    colId: 'group',
                    headerName: 'Group',
                    field: 'label',
                    cellRenderer: 'agGroupCellRenderer',
                    cellRendererParams: {
                        suppressCount: true,
                    },
                    editable: true,
                    groupRowEditable: true,
                },
                { field: 'category', rowGroup: true, hide: true },
            ],
            rowData: [
                { id: 'a-1', category: 'A', label: 'A1' },
                { id: 'a-2', category: 'A', label: 'A2' },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        };

        const api = await gridMgr.createGridAndWait('groupEditClipboardPaste', gridOptions);

        await new GridRows(api, 'before group paste').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-category-A
            · ├── LEAF id:a-1 group:"A1" category:"A"
            · └── LEAF id:a-2 group:"A2" category:"A"
        `);

        const groupRowNode = api.getDisplayedRowAtIndex(0)!;
        expect(groupRowNode.group).toBe(true);

        const groupCol = api.getDisplayedCenterColumns()[0]!;
        const groupColId = groupCol.getColId();

        // Paste on the group row — groupRowEditable triggers cascade to all children
        clipboardUtils.setText('Edited Group');
        api.setFocusedCell(groupRowNode.rowIndex!, groupColId);
        const pasteEnd = waitForEvent('pasteEnd', api);
        api.pasteFromClipboard();
        await pasteEnd;

        await new GridRows(api, 'after group paste').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-category-A
            · ├── LEAF id:a-1 group:"Edited Group" category:"A"
            · └── LEAF id:a-2 group:"Edited Group" category:"A"
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            └── group "Group" width:200 editable
        `);
    });

    test('paste skips group row when groupRowEditable is not set', async () => {
        const gridOptions: GridOptions = {
            groupDisplayType: 'custom',
            defaultColDef: {
                cellEditor: 'agTextCellEditor',
            },
            columnDefs: [
                {
                    colId: 'group',
                    headerName: 'Group',
                    field: 'label',
                    cellRenderer: 'agGroupCellRenderer',
                    cellRendererParams: {
                        suppressCount: true,
                    },
                    editable: true,
                },
                { field: 'category', rowGroup: true, hide: true },
            ],
            rowData: [
                { id: 'a-1', category: 'A', label: 'A1' },
                { id: 'a-2', category: 'A', label: 'A2' },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        };

        const api = await gridMgr.createGridAndWait('groupEditClipboardPasteSkip', gridOptions);

        await new GridRows(api, 'before paste').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-category-A
            · ├── LEAF id:a-1 group:"A1" category:"A"
            · └── LEAF id:a-2 group:"A2" category:"A"
        `);

        const groupRowNode = api.getDisplayedRowAtIndex(0)!;
        expect(groupRowNode.group).toBe(true);

        const groupCol = api.getDisplayedCenterColumns()[0]!;
        const groupColId = groupCol.getColId();

        // Paste while focused on group row — no groupRowEditable, so group row is skipped,
        // paste goes to the first leaf child instead
        clipboardUtils.setText('Pasted Value');
        api.setFocusedCell(groupRowNode.rowIndex!, groupColId);
        const pasteEnd = waitForEvent('pasteEnd', api);
        api.pasteFromClipboard();
        await pasteEnd;

        await new GridRows(api, 'after paste skips group').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-category-A
            · ├── LEAF id:a-1 group:"Pasted Value" category:"A"
            · └── LEAF id:a-2 group:"A2" category:"A"
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            └── group "Group" width:200 editable
        `);
    });

    test('paste does not skip group row when enableGroupEdit is true', async () => {
        const gridOptions: GridOptions = {
            groupDisplayType: 'custom',
            enableGroupEdit: true,
            defaultColDef: {
                cellEditor: 'agTextCellEditor',
            },
            columnDefs: [
                {
                    colId: 'group',
                    headerName: 'Group',
                    field: 'label',
                    cellRenderer: 'agGroupCellRenderer',
                    cellRendererParams: {
                        suppressCount: true,
                    },
                    editable: true,
                },
                { field: 'category', rowGroup: true, hide: true },
            ],
            rowData: [
                { id: 'a-1', category: 'A', label: 'A1' },
                { id: 'a-2', category: 'A', label: 'A2' },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        };

        const api = await gridMgr.createGridAndWait('groupEditClipboardPasteEnableGroupEdit', gridOptions);

        await new GridRows(api, 'before paste').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-category-A
            · ├── LEAF id:a-1 group:"A1" category:"A"
            · └── LEAF id:a-2 group:"A2" category:"A"
        `);

        const groupRowNode = api.getDisplayedRowAtIndex(0)!;
        expect(groupRowNode.group).toBe(true);

        const groupCol = api.getDisplayedCenterColumns()[0]!;

        // Paste while focused on group row — enableGroupEdit: true disables group row skipping
        clipboardUtils.setText('Pasted Value');
        api.setFocusedCell(groupRowNode.rowIndex!, groupCol.getColId());
        const pasteEnd = waitForEvent('pasteEnd', api);
        api.pasteFromClipboard();
        await pasteEnd;

        // enableGroupEdit creates data on the group row, so paste writes to the group row directly
        expect(api.getDisplayedRowAtIndex(0)!.data?.label).toBe('Pasted Value');
    });

    test('setDataValue on group row with groupRowValueSetter: true distributes to children', async () => {
        const gridOptions: GridOptions = {
            groupDisplayType: 'custom',
            defaultColDef: {
                cellEditor: 'agTextCellEditor',
            },
            columnDefs: [
                { colId: 'group', headerName: 'Group', cellRenderer: 'agGroupCellRenderer' },
                { field: 'region', rowGroup: true, hide: true },
                {
                    colId: 'amount',
                    field: 'amount',
                    aggFunc: 'sum',
                    editable: true,
                    groupRowEditable: true,
                    groupRowValueSetter: true,
                },
            ],
            rowData: [
                { id: 'a1', region: 'R', amount: 10 },
                { id: 'a2', region: 'R', amount: 20 },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        };

        const api = await gridMgr.createGridAndWait('groupSetDataValueDistribute', gridOptions);

        await new GridRows(api, 'before edit').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-region-R amount:30
            · ├── LEAF id:a1 region:"R" amount:10
            · └── LEAF id:a2 region:"R" amount:20
        `);

        const groupNode = api.getRowNode('row-group-region-R')!;
        expect(groupNode.group).toBe(true);

        groupNode.setDataValue('amount', 60, 'ui');
        await asyncSetTimeout(0);

        // Built-in uniform distribution: 60 / 2 = 30 each
        await new GridRows(api, 'after setDataValue distribute').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-region-R amount:60
            · ├── LEAF id:a1 region:"R" amount:30
            · └── LEAF id:a2 region:"R" amount:30
        `);
    });

    test('paste on group row with groupRowValueSetter distributes to children', async () => {
        const gridOptions: GridOptions = {
            groupDisplayType: 'custom',
            defaultColDef: {
                cellEditor: 'agTextCellEditor',
            },
            columnDefs: [
                { colId: 'group', headerName: 'Group', cellRenderer: 'agGroupCellRenderer' },
                { field: 'region', rowGroup: true, hide: true },
                {
                    colId: 'amount',
                    field: 'amount',
                    aggFunc: 'sum',
                    editable: true,
                    groupRowEditable: true,
                    groupRowValueSetter: true,
                },
            ],
            rowData: [
                { id: 'a1', region: 'R', amount: 10 },
                { id: 'a2', region: 'R', amount: 20 },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        };

        const api = await gridMgr.createGridAndWait('groupPasteDistribute', gridOptions);

        await new GridRows(api, 'before paste').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-region-R amount:30
            · ├── LEAF id:a1 region:"R" amount:10
            · └── LEAF id:a2 region:"R" amount:20
        `);

        const groupNode = api.getRowNode('row-group-region-R')!;
        expect(groupNode.group).toBe(true);

        // Paste "60" onto the group row's amount cell
        clipboardUtils.setText('60');
        api.setFocusedCell(groupNode.rowIndex!, 'amount');
        const pasteEnd = waitForEvent('pasteEnd', api);
        api.pasteFromClipboard();
        await pasteEnd;

        // Built-in uniform distribution: 60 / 2 = 30 each
        await new GridRows(api, 'after paste distribute').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-region-R amount:60
            · ├── LEAF id:a1 region:"R" amount:30
            · └── LEAF id:a2 region:"R" amount:30
        `);
    });

    test('paste single value into range on group row with groupRowEditable distributes', async () => {
        const gridOptions: GridOptions = {
            groupDisplayType: 'custom',
            defaultColDef: {
                cellEditor: 'agTextCellEditor',
            },
            columnDefs: [
                { colId: 'group', headerName: 'Group', cellRenderer: 'agGroupCellRenderer' },
                { field: 'region', rowGroup: true, hide: true },
                {
                    colId: 'amount',
                    field: 'amount',
                    aggFunc: 'sum',
                    editable: true,
                    groupRowEditable: true,
                    groupRowValueSetter: true,
                },
            ],
            rowData: [
                { id: 'a1', region: 'R', amount: 10 },
                { id: 'a2', region: 'R', amount: 20 },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        };

        const api = await gridMgr.createGridAndWait('groupPasteSingleRange', gridOptions);

        await new GridRows(api, 'before paste').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-region-R amount:30
            · ├── LEAF id:a1 region:"R" amount:10
            · └── LEAF id:a2 region:"R" amount:20
        `);

        const groupNode = api.getRowNode('row-group-region-R')!;
        expect(groupNode.group).toBe(true);

        // Select the group row cell to create a range, then paste a single value into it
        api.setFocusedCell(groupNode.rowIndex!, 'amount');
        api.addCellRange({ rowStartIndex: groupNode.rowIndex!, rowEndIndex: groupNode.rowIndex!, columns: ['amount'] });
        await asyncSetTimeout(0);

        clipboardUtils.setText('100');
        const pasteEnd = waitForEvent('pasteEnd', api);
        api.pasteFromClipboard();
        await pasteEnd;

        // Built-in uniform distribution: 100 / 2 = 50 each
        await new GridRows(api, 'after single-value range paste').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-region-R amount:100
            · ├── LEAF id:a1 region:"R" amount:50
            · └── LEAF id:a2 region:"R" amount:50
        `);
    });
});
