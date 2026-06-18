import { AllCommunityModule, ClientSideRowModelModule, UndoRedoEditModule } from 'ag-grid-community';
import { PivotModule, RowGroupingEditModule, RowGroupingModule, TreeDataModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../../../test-utils';
import { createGroupRowData as createRowData } from '../group-edit-test-utils';
import { distributeGroupValue, gridsManager } from './distribute-test-utils';

afterEach(() => {
    gridsManager.reset();
});

describe('distributeGroupValue multi-level group hierarchy', () => {
    test('percentage mode propagates through nested groups to leaves', async () => {
        const api = await gridsManager.createGridAndWait('distribute-hierarchy-pct', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
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
                    groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'percentage' }),
                },
            ],
            rowData: createRowData(),
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });

        await new GridRows(api, 'before edit').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:180
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:60
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:30
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:30
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:60
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:60
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
            └─┬ filler id:row-group-region-Americas amount:160
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:100
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:60
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `);

        // Americas has child groups: USA(100) and Canada(60) = 160 total
        // Percentage: USA gets 100/160*320 = 200, Canada gets 60/160*320 = 120
        // Then leaves: nyc=70/100*200=140, la=30/100*200=60, toronto=35/60*120=70, vancouver=25/60*120=50
        const americasNode = api.getRowNode('row-group-region-Americas')!;
        americasNode.setDataValue('amount', 320, 'ui');
        await asyncSetTimeout(0);

        await new GridRows(api, 'after percentage edit on top-level group').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:180
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:60
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:30
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:30
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:60
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:60
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
            └─┬ filler id:row-group-region-Americas amount:320
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:200
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:140
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:60
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:120
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:70
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:50
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── group "Group" width:200
            └── amount "Amount" width:200 aggFunc:sum editable
        `);
    });

    test('increment mode propagates through nested groups to leaves', async () => {
        const api = await gridsManager.createGridAndWait('distribute-hierarchy-inc', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
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
                    groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'increment' }),
                },
            ],
            rowData: createRowData(),
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });

        // Americas(160) → 200, delta=40. 2 child groups → +20 each
        // USA(100→120): +10 each leaf → nyc:80, la:40
        // Canada(60→80): +10 each leaf → toronto:45, vancouver:35
        const americasNode = api.getRowNode('row-group-region-Americas')!;
        americasNode.setDataValue('amount', 200, 'ui');
        await asyncSetTimeout(0);

        await new GridRows(api, 'after increment edit on top-level group').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:180
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:60
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:30
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:30
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:60
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:60
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
            └─┬ filler id:row-group-region-Americas amount:200
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:120
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:80
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:40
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:80
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:45
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:35
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── group "Group" width:200
            └── amount "Amount" width:200 aggFunc:sum editable
        `);
    });

    test('overwrite mode propagates through nested groups to leaves', async () => {
        const api = await gridsManager.createGridAndWait('distribute-hierarchy-overwrite', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
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
                    groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'overwrite' }),
                },
            ],
            rowData: createRowData(),
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });

        // Overwrite → all children at every level get 99
        const americasNode = api.getRowNode('row-group-region-Americas')!;
        americasNode.setDataValue('amount', 99, 'ui');
        await asyncSetTimeout(0);

        await new GridRows(api, 'after overwrite edit on top-level group').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:180
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:60
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:30
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:30
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:60
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:60
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
            └─┬ filler id:row-group-region-Americas amount:396
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:198
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:99
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:99
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:198
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:99
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:99
        `);
    });

    test('uniform mode (default for sum) cascades through nested groups', async () => {
        const api = await gridsManager.createGridAndWait('distribute-hierarchy-uniform', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
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
                    groupRowValueSetter: distributeGroupValue,
                },
            ],
            rowData: createRowData(),
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });

        // Europe(180) → 600, uniform. 3 child groups: 600/3=200 each. Each has 2 leaves: 200/2=100
        const europeNode = api.getRowNode('row-group-region-Europe')!;
        europeNode.setDataValue('amount', 600, 'ui');
        await asyncSetTimeout(0);

        await new GridRows(api, 'after uniform cascade').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:600
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:200
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:100
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:100
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:200
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:100
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:100
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:200
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:100
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:100
            └─┬ filler id:row-group-region-Americas amount:160
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:100
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:60
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `);
    });

    test('options object on colDef propagates through nested groups', async () => {
        const api = await gridsManager.createGridAndWait('distribute-hierarchy-opts', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
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
                    groupRowValueSetter: { distribution: 'percentage' },
                },
            ],
            rowData: createRowData(),
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });

        // Same as percentage hierarchy test above, but using options object on colDef
        const americasNode = api.getRowNode('row-group-region-Americas')!;
        americasNode.setDataValue('amount', 320, 'ui');
        await asyncSetTimeout(0);

        await new GridRows(api, 'after percentage via options object').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:180
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:60
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:30
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:30
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:60
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:60
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
            └─┬ filler id:row-group-region-Americas amount:320
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:200
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:140
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:60
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:120
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:70
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:50
        `);
    });
});

describe('distributeGroupValue with treeData', () => {
    function createTreeData() {
        return [
            { id: 'hq', orgHierarchy: ['HQ'], budget: 0 },
            { id: 'eng', orgHierarchy: ['HQ', 'Engineering'], budget: 0 },
            { id: 'eng-fe', orgHierarchy: ['HQ', 'Engineering', 'Frontend'], budget: 40 },
            { id: 'eng-be', orgHierarchy: ['HQ', 'Engineering', 'Backend'], budget: 60 },
            { id: 'sales', orgHierarchy: ['HQ', 'Sales'], budget: 0 },
            { id: 'sales-na', orgHierarchy: ['HQ', 'Sales', 'North America'], budget: 80 },
            { id: 'sales-eu', orgHierarchy: ['HQ', 'Sales', 'Europe'], budget: 20 },
        ];
    }

    test('uniform distribution cascades through tree hierarchy', async () => {
        const api = await gridsManager.createGridAndWait('distribute-tree-uniform', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
            treeData: true,
            treeDataChildrenField: undefined,
            getDataPath: (data: any) => data.orgHierarchy,
            columnDefs: [
                {
                    colId: 'budget',
                    field: 'budget',
                    aggFunc: 'sum',
                    editable: true,
                    groupRowEditable: true,
                    groupRowValueSetter: distributeGroupValue,
                },
            ],
            rowData: createTreeData(),
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });

        await new GridRows(api, 'before edit').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ HQ GROUP id:hq ag-Grid-AutoColumn:"HQ" budget:200
            · ├─┬ Engineering GROUP id:eng ag-Grid-AutoColumn:"Engineering" budget:100
            · │ ├── Frontend LEAF id:eng-fe ag-Grid-AutoColumn:"Frontend" budget:40
            · │ └── Backend LEAF id:eng-be ag-Grid-AutoColumn:"Backend" budget:60
            · └─┬ Sales GROUP id:sales ag-Grid-AutoColumn:"Sales" budget:100
            · · ├── "North America" LEAF id:sales-na ag-Grid-AutoColumn:"North America" budget:80
            · · └── Europe LEAF id:sales-eu ag-Grid-AutoColumn:"Europe" budget:20
        `);

        // HQ(200) → 400, uniform. 2 children: 400/2=200 each. Each has 2 leaves: 200/2=100
        const hqNode = api.getRowNode('hq')!;
        hqNode.setDataValue('budget', 400, 'ui');
        await asyncSetTimeout(0);

        await new GridRows(api, 'after uniform tree edit').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ HQ GROUP id:hq ag-Grid-AutoColumn:"HQ" budget:400
            · ├─┬ Engineering GROUP id:eng ag-Grid-AutoColumn:"Engineering" budget:200
            · │ ├── Frontend LEAF id:eng-fe ag-Grid-AutoColumn:"Frontend" budget:100
            · │ └── Backend LEAF id:eng-be ag-Grid-AutoColumn:"Backend" budget:100
            · └─┬ Sales GROUP id:sales ag-Grid-AutoColumn:"Sales" budget:200
            · · ├── "North America" LEAF id:sales-na ag-Grid-AutoColumn:"North America" budget:100
            · · └── Europe LEAF id:sales-eu ag-Grid-AutoColumn:"Europe" budget:100
        `);
    });

    test('percentage distribution cascades through tree hierarchy', async () => {
        const api = await gridsManager.createGridAndWait('distribute-tree-pct', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
            treeData: true,
            treeDataChildrenField: undefined,
            getDataPath: (data: any) => data.orgHierarchy,
            columnDefs: [
                {
                    colId: 'budget',
                    field: 'budget',
                    aggFunc: 'sum',
                    editable: true,
                    groupRowEditable: true,
                    groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'percentage' }),
                },
            ],
            rowData: createTreeData(),
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });

        // HQ(200) → 400 with percentage
        // Engineering(100/200*400=200), Sales(100/200*400=200)
        // Frontend(40/100*200=80), Backend(60/100*200=120)
        // NA(80/100*200=160), EU(20/100*200=40)
        const hqNode = api.getRowNode('hq')!;
        hqNode.setDataValue('budget', 400, 'ui');
        await asyncSetTimeout(0);

        await new GridRows(api, 'after percentage tree edit').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ HQ GROUP id:hq ag-Grid-AutoColumn:"HQ" budget:400
            · ├─┬ Engineering GROUP id:eng ag-Grid-AutoColumn:"Engineering" budget:200
            · │ ├── Frontend LEAF id:eng-fe ag-Grid-AutoColumn:"Frontend" budget:80
            · │ └── Backend LEAF id:eng-be ag-Grid-AutoColumn:"Backend" budget:120
            · └─┬ Sales GROUP id:sales ag-Grid-AutoColumn:"Sales" budget:200
            · · ├── "North America" LEAF id:sales-na ag-Grid-AutoColumn:"North America" budget:160
            · · └── Europe LEAF id:sales-eu ag-Grid-AutoColumn:"Europe" budget:40
        `);
    });

    test('editing a mid-level tree node distributes to its subtree only', async () => {
        const api = await gridsManager.createGridAndWait('distribute-tree-mid', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
            treeData: true,
            treeDataChildrenField: undefined,
            getDataPath: (data: any) => data.orgHierarchy,
            columnDefs: [
                {
                    colId: 'budget',
                    field: 'budget',
                    aggFunc: 'sum',
                    editable: true,
                    groupRowEditable: true,
                    groupRowValueSetter: distributeGroupValue,
                },
            ],
            rowData: createTreeData(),
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });

        // Edit just Engineering(100) → 300, uniform: 300/2=150 each. Sales untouched.
        const engNode = api.getRowNode('eng')!;
        engNode.setDataValue('budget', 300, 'ui');
        await asyncSetTimeout(0);

        await new GridRows(api, 'after mid-level tree edit').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ HQ GROUP id:hq ag-Grid-AutoColumn:"HQ" budget:400
            · ├─┬ Engineering GROUP id:eng ag-Grid-AutoColumn:"Engineering" budget:300
            · │ ├── Frontend LEAF id:eng-fe ag-Grid-AutoColumn:"Frontend" budget:150
            · │ └── Backend LEAF id:eng-be ag-Grid-AutoColumn:"Backend" budget:150
            · └─┬ Sales GROUP id:sales ag-Grid-AutoColumn:"Sales" budget:100
            · · ├── "North America" LEAF id:sales-na ag-Grid-AutoColumn:"North America" budget:80
            · · └── Europe LEAF id:sales-eu ag-Grid-AutoColumn:"Europe" budget:20
        `);
    });
});

describe('distributeGroupValue with treeData and filler nodes', () => {
    test('uniform distribution through filler nodes in tree hierarchy', async () => {
        // Create tree data where some paths have missing intermediate nodes (fillers)
        const api = await gridsManager.createGridAndWait('distribute-tree-filler', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
            treeData: true,
            treeDataChildrenField: undefined,
            getDataPath: (data: any) => data.orgHierarchy,
            columnDefs: [
                {
                    colId: 'budget',
                    field: 'budget',
                    aggFunc: 'sum',
                    editable: true,
                    groupRowEditable: true,
                    groupRowValueSetter: distributeGroupValue,
                },
            ],
            rowData: [
                // No explicit 'HQ' node — it will be created as a filler
                { id: 'eng-fe', orgHierarchy: ['HQ', 'Engineering', 'Frontend'], budget: 40 },
                { id: 'eng-be', orgHierarchy: ['HQ', 'Engineering', 'Backend'], budget: 60 },
                { id: 'sales-na', orgHierarchy: ['HQ', 'Sales', 'North America'], budget: 80 },
                { id: 'sales-eu', orgHierarchy: ['HQ', 'Sales', 'Europe'], budget: 20 },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });

        await new GridRows(api, 'before edit').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ HQ filler id:row-group-0-HQ ag-Grid-AutoColumn:"HQ" budget:200
            · ├─┬ Engineering filler id:row-group-0-HQ-1-Engineering ag-Grid-AutoColumn:"Engineering" budget:100
            · │ ├── Frontend LEAF id:eng-fe ag-Grid-AutoColumn:"Frontend" budget:40
            · │ └── Backend LEAF id:eng-be ag-Grid-AutoColumn:"Backend" budget:60
            · └─┬ Sales filler id:row-group-0-HQ-1-Sales ag-Grid-AutoColumn:"Sales" budget:100
            · · ├── "North America" LEAF id:sales-na ag-Grid-AutoColumn:"North America" budget:80
            · · └── Europe LEAF id:sales-eu ag-Grid-AutoColumn:"Europe" budget:20
        `);

        // Edit the top-level filler "HQ" (200) → 400, uniform: 400/2=200 per child filler
        // Engineering filler(200): 200/2=100 each leaf
        // Sales filler(200): 200/2=100 each leaf
        const hqFiller = api.getRowNode('row-group-0-HQ')!;
        hqFiller.setDataValue('budget', 400, 'ui');
        await asyncSetTimeout(0);

        await new GridRows(api, 'after filler edit').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ HQ filler id:row-group-0-HQ ag-Grid-AutoColumn:"HQ" budget:400
            · ├─┬ Engineering filler id:row-group-0-HQ-1-Engineering ag-Grid-AutoColumn:"Engineering" budget:200
            · │ ├── Frontend LEAF id:eng-fe ag-Grid-AutoColumn:"Frontend" budget:100
            · │ └── Backend LEAF id:eng-be ag-Grid-AutoColumn:"Backend" budget:100
            · └─┬ Sales filler id:row-group-0-HQ-1-Sales ag-Grid-AutoColumn:"Sales" budget:200
            · · ├── "North America" LEAF id:sales-na ag-Grid-AutoColumn:"North America" budget:100
            · · └── Europe LEAF id:sales-eu ag-Grid-AutoColumn:"Europe" budget:100
        `);
    });

    test('percentage distribution through filler nodes in tree hierarchy', async () => {
        const api = await gridsManager.createGridAndWait('distribute-tree-filler-pct', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
            treeData: true,
            treeDataChildrenField: undefined,
            getDataPath: (data: any) => data.orgHierarchy,
            columnDefs: [
                {
                    colId: 'budget',
                    field: 'budget',
                    aggFunc: 'sum',
                    editable: true,
                    groupRowEditable: true,
                    groupRowValueSetter: { distribution: 'percentage' },
                },
            ],
            rowData: [
                { id: 'eng-fe', orgHierarchy: ['HQ', 'Engineering', 'Frontend'], budget: 40 },
                { id: 'eng-be', orgHierarchy: ['HQ', 'Engineering', 'Backend'], budget: 60 },
                { id: 'sales-na', orgHierarchy: ['HQ', 'Sales', 'North America'], budget: 80 },
                { id: 'sales-eu', orgHierarchy: ['HQ', 'Sales', 'Europe'], budget: 20 },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });

        // HQ filler(200) → 400 with percentage via options object
        // Engineering filler 100/200*400=200, Sales filler 100/200*400=200
        // Frontend 40/100*200=80, Backend 60/100*200=120
        // NA 80/100*200=160, EU 20/100*200=40
        const hqFiller = api.getRowNode('row-group-0-HQ')!;
        hqFiller.setDataValue('budget', 400, 'ui');
        await asyncSetTimeout(0);

        await new GridRows(api, 'after filler percentage edit').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ HQ filler id:row-group-0-HQ ag-Grid-AutoColumn:"HQ" budget:400
            · ├─┬ Engineering filler id:row-group-0-HQ-1-Engineering ag-Grid-AutoColumn:"Engineering" budget:200
            · │ ├── Frontend LEAF id:eng-fe ag-Grid-AutoColumn:"Frontend" budget:80
            · │ └── Backend LEAF id:eng-be ag-Grid-AutoColumn:"Backend" budget:120
            · └─┬ Sales filler id:row-group-0-HQ-1-Sales ag-Grid-AutoColumn:"Sales" budget:200
            · · ├── "North America" LEAF id:sales-na ag-Grid-AutoColumn:"North America" budget:160
            · · └── Europe LEAF id:sales-eu ag-Grid-AutoColumn:"Europe" budget:40
        `);
    });
});

describe('distributeGroupValue with groupHideOpenParents', () => {
    test('distribution works correctly when open parent rows are hidden', async () => {
        const api = await gridsManager.createGridAndWait('distribute-hide-open-parents', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
            columnDefs: [
                { field: 'region', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                {
                    colId: 'amount',
                    field: 'amount',
                    aggFunc: 'sum',
                    editable: true,
                    groupRowEditable: true,
                    groupRowValueSetter: distributeGroupValue,
                },
            ],
            rowData: createRowData(),
            groupDefaultExpanded: -1,
            groupHideOpenParents: true,
            getRowId: (params) => params.data?.id,
        });
        await new GridColumns(api, `distribution works correctly when open parent rows are hidden setup`).checkColumns(
            `
                CENTER
                ├── ag-Grid-AutoColumn-region "Region" width:200
                ├── ag-Grid-AutoColumn-country "Country" width:200
                └── amount "Amount" width:200 aggFunc:sum editable
            `
        );
        await new GridRows(api, `distribution works correctly when open parent rows are hidden setup`).check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-region:null ag-Grid-AutoColumn-country:null
            ├── LEAF id:fr-paris ag-Grid-AutoColumn-region:"Europe" ag-Grid-AutoColumn-country:"France" region:"Europe" country:"France" amount:30
            ├── LEAF id:fr-lyon region:"Europe" country:"France" amount:30
            ├── LEAF id:de-berlin ag-Grid-AutoColumn-country:"Germany" region:"Europe" country:"Germany" amount:30
            ├── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
            ├── LEAF id:it-rome ag-Grid-AutoColumn-country:"Italy" region:"Europe" country:"Italy" amount:30
            ├── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
            ├── LEAF id:us-nyc ag-Grid-AutoColumn-region:"Americas" ag-Grid-AutoColumn-country:"USA" region:"Americas" country:"USA" amount:70
            ├── LEAF id:us-la region:"Americas" country:"USA" amount:30
            ├── LEAF id:ca-toronto ag-Grid-AutoColumn-country:"Canada" region:"Americas" country:"Canada" amount:35
            └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `);

        // With groupHideOpenParents, expanded group rows are hidden from the display,
        // but the tree structure is unchanged — distribution should still work
        const franceNode = api.getRowNode('row-group-region-Europe-country-France')!;
        franceNode.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('fr-paris')?.data?.amount).toBe(50);
        expect(api.getRowNode('fr-lyon')?.data?.amount).toBe(50);
        expect(franceNode.aggData?.amount).toBe(100);
        await new GridRows(api, `distribution works correctly when open parent rows are hidden final state`).check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-region:null ag-Grid-AutoColumn-country:null
            ├── LEAF id:fr-paris ag-Grid-AutoColumn-region:"Europe" ag-Grid-AutoColumn-country:"France" region:"Europe" country:"France" amount:50
            ├── LEAF id:fr-lyon region:"Europe" country:"France" amount:50
            ├── LEAF id:de-berlin ag-Grid-AutoColumn-country:"Germany" region:"Europe" country:"Germany" amount:30
            ├── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
            ├── LEAF id:it-rome ag-Grid-AutoColumn-country:"Italy" region:"Europe" country:"Italy" amount:30
            ├── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
            ├── LEAF id:us-nyc ag-Grid-AutoColumn-region:"Americas" ag-Grid-AutoColumn-country:"USA" region:"Americas" country:"USA" amount:70
            ├── LEAF id:us-la region:"Americas" country:"USA" amount:30
            ├── LEAF id:ca-toronto ag-Grid-AutoColumn-country:"Canada" region:"Americas" country:"Canada" amount:35
            └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `);
    });
});

describe('distributeGroupValue with groupHideParentOfSingleChild', () => {
    test('distribution works when single-child parents are hidden', async () => {
        const api = await gridsManager.createGridAndWait('distribute-hide-single-child', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
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
                    groupRowValueSetter: distributeGroupValue,
                },
            ],
            rowData: [
                { id: 'a1', region: 'Solo', country: 'Alone', amount: 50 },
                { id: 'a2', region: 'Pair', country: 'Twin', amount: 30 },
                { id: 'a3', region: 'Pair', country: 'Twin', amount: 70 },
            ],
            groupDefaultExpanded: -1,
            groupHideParentOfSingleChild: true,
            getRowId: (params) => params.data?.id,
        });
        await new GridColumns(api, `distribution works when single-child parents are hidden setup`).checkColumns(`
            CENTER
            ├── group "Group" width:200
            └── amount "Amount" width:200 aggFunc:sum editable
        `);
        await new GridRows(api, `distribution works when single-child parents are hidden setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:a1 region:"Solo" country:"Alone" amount:50
            └─┬ LEAF_GROUP id:row-group-region-Pair-country-Twin amount:100
            · ├── LEAF id:a2 region:"Pair" country:"Twin" amount:30
            · └── LEAF id:a3 region:"Pair" country:"Twin" amount:70
        `);

        // "Pair > Twin" has 2 leaves, distribution works normally
        const twinNode = api.getRowNode('row-group-region-Pair-country-Twin')!;
        twinNode.setDataValue('amount', 200, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a2')?.data?.amount).toBe(100);
        expect(api.getRowNode('a3')?.data?.amount).toBe(100);
        expect(twinNode.aggData?.amount).toBe(200);
        await new GridRows(api, `distribution works when single-child parents are hidden final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:a1 region:"Solo" country:"Alone" amount:50
            └─┬ LEAF_GROUP id:row-group-region-Pair-country-Twin amount:200
            · ├── LEAF id:a2 region:"Pair" country:"Twin" amount:100
            · └── LEAF id:a3 region:"Pair" country:"Twin" amount:100
        `);
    });
});

describe('distributeGroupValue with groupAllowUnbalanced', () => {
    test('distribution works with unbalanced groups where some rows skip levels', async () => {
        const api = await gridsManager.createGridAndWait('distribute-unbalanced', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
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
                    groupRowValueSetter: distributeGroupValue,
                },
            ],
            rowData: [
                { id: 'a1', region: 'Europe', country: 'France', amount: 30 },
                { id: 'a2', region: 'Europe', country: 'Germany', amount: 70 },
                // Row with null country — skips the country grouping level when unbalanced
                { id: 'a3', region: 'Europe', country: null, amount: 50 },
            ],
            groupDefaultExpanded: -1,
            groupAllowUnbalanced: true,
            getRowId: (params) => params.data?.id,
        });
        await new GridColumns(api, `distribution works with unbalanced groups where some rows skip levels setup`)
            .checkColumns(`
                CENTER
                ├── group "Group" width:200
                └── amount "Amount" width:200 aggFunc:sum editable
            `);
        await new GridRows(api, `distribution works with unbalanced groups where some rows skip levels setup`).check(
            `
                ROOT id:ROOT_NODE_ID
                └─┬ filler id:row-group-region-Europe amount:150
                · ├── LEAF id:a3 region:"Europe" country:null amount:50
                · ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:30
                · │ └── LEAF id:a1 region:"Europe" country:"France" amount:30
                · └─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:70
                · · └── LEAF id:a2 region:"Europe" country:"Germany" amount:70
            `
        );

        // Edit the France leaf group (has 1 child), distribute uniformly
        const franceNode = api.getRowNode('row-group-region-Europe-country-France')!;
        franceNode.setDataValue('amount', 90, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(90);
        expect(franceNode.aggData?.amount).toBe(90);
        await new GridRows(api, `distribution works with unbalanced groups where some rows skip levels final state`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └─┬ filler id:row-group-region-Europe amount:210
                · ├── LEAF id:a3 region:"Europe" country:null amount:50
                · ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:90
                · │ └── LEAF id:a1 region:"Europe" country:"France" amount:90
                · └─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:70
                · · └── LEAF id:a2 region:"Europe" country:"Germany" amount:70
            `);
    });
});

describe('distributeGroupValue with pivot mode', () => {
    const pivotGridsManager = new TestGridsManager({
        modules: [
            AllCommunityModule,
            ClientSideRowModelModule,
            RowGroupingModule,
            RowGroupingEditModule,
            PivotModule,
            UndoRedoEditModule,
            TreeDataModule,
        ],
    });

    afterEach(() => {
        pivotGridsManager.reset();
    });

    function createPivotRowData() {
        return [
            { id: '1', region: 'Europe', country: 'France', year: 2020, sales: 1000 },
            { id: '2', region: 'Europe', country: 'France', year: 2021, sales: 1200 },
            { id: '3', region: 'Europe', country: 'Germany', year: 2020, sales: 1500 },
            { id: '4', region: 'Europe', country: 'Germany', year: 2021, sales: 1800 },
            { id: '5', region: 'Americas', country: 'USA', year: 2020, sales: 2000 },
            { id: '6', region: 'Americas', country: 'USA', year: 2021, sales: 2200 },
        ];
    }

    test('uniform distribution on pivot leaf group distributes to matching pivot children', async () => {
        const api = await pivotGridsManager.createGridAndWait('pivot-uniform', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                {
                    field: 'sales',
                    aggFunc: 'sum',
                    hide: true,
                    editable: true,
                    groupRowEditable: true,
                    groupRowValueSetter: distributeGroupValue,
                },
            ],
            pivotMode: true,
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: createPivotRowData(),
        });
        await new GridColumns(
            api,
            `uniform distribution on pivot leaf group distributes to matching pivot children setup`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├─┬ "2020" GROUP
            │ └── pivot_year_2020_sales "Sales" width:200 columnGroupShow:open editable
            └─┬ "2021" GROUP
              └── pivot_year_2021_sales "Sales" width:200 columnGroupShow:open editable
        `);
        await new GridRows(api, `uniform distribution on pivot leaf group distributes to matching pivot children setup`)
            .check(`
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:4500 pivot_year_2021_sales:5200
                ├─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                │ ├── LEAF hidden id:1 pivot_year_2020_sales:1000 pivot_year_2021_sales:1000
                │ └── LEAF hidden id:2 pivot_year_2020_sales:1200 pivot_year_2021_sales:1200
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                │ ├── LEAF hidden id:3 pivot_year_2020_sales:1500 pivot_year_2021_sales:1500
                │ └── LEAF hidden id:4 pivot_year_2020_sales:1800 pivot_year_2021_sales:1800
                └─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                · ├── LEAF hidden id:5 pivot_year_2020_sales:2000 pivot_year_2021_sales:2000
                · └── LEAF hidden id:6 pivot_year_2020_sales:2200 pivot_year_2021_sales:2200
            `);

        const pivotColumns = api.getPivotResultColumns()!;
        const pivotCol2020 = pivotColumns.find((col) => col.getColId().includes('2020_sales'))!;

        // France 2020: only row '1' (sales=1000). Set to 3000 → single child gets 3000
        const franceNode = api.getRowNode('row-group-country-France')!;
        franceNode.setDataValue(pivotCol2020, 3000, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('1')?.data?.sales).toBe(3000);
        // Row '2' is year 2021, should be untouched
        expect(api.getRowNode('2')?.data?.sales).toBe(1200);
        await new GridRows(
            api,
            `uniform distribution on pivot leaf group distributes to matching pivot children final state`
        ).check(`
            ROOT id:ROOT_NODE_ID pivot_year_2020_sales:6500 pivot_year_2021_sales:5200
            ├─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:3000 pivot_year_2021_sales:1200
            │ ├── LEAF hidden id:1 pivot_year_2020_sales:3000 pivot_year_2021_sales:3000
            │ └── LEAF hidden id:2 pivot_year_2020_sales:1200 pivot_year_2021_sales:1200
            ├─┬ LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
            │ ├── LEAF hidden id:3 pivot_year_2020_sales:1500 pivot_year_2021_sales:1500
            │ └── LEAF hidden id:4 pivot_year_2020_sales:1800 pivot_year_2021_sales:1800
            └─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
            · ├── LEAF hidden id:5 pivot_year_2020_sales:2000 pivot_year_2021_sales:2000
            · └── LEAF hidden id:6 pivot_year_2020_sales:2200 pivot_year_2021_sales:2200
        `);
    });

    test('percentage distribution on pivot leaf group scales pivot-matching children', async () => {
        const api = await pivotGridsManager.createGridAndWait('pivot-pct', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                {
                    field: 'sales',
                    aggFunc: 'sum',
                    hide: true,
                    editable: true,
                    groupRowEditable: true,
                    groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'percentage' }),
                },
            ],
            pivotMode: true,
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: [
                // USA has 2 rows for year 2020 to test percentage within a pivot column
                { id: '5', region: 'Americas', country: 'USA', year: 2020, sales: 2000 },
                { id: '5b', region: 'Americas', country: 'USA', year: 2020, sales: 3000 },
                { id: '6', region: 'Americas', country: 'USA', year: 2021, sales: 2200 },
            ],
        });
        await new GridColumns(api, `percentage distribution on pivot leaf group scales pivot-matching children setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├─┬ "2020" GROUP
                │ └── pivot_year_2020_sales "Sales" width:200 columnGroupShow:open editable
                └─┬ "2021" GROUP
                  └── pivot_year_2021_sales "Sales" width:200 columnGroupShow:open editable
            `);
        await new GridRows(api, `percentage distribution on pivot leaf group scales pivot-matching children setup`)
            .check(`
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:5000 pivot_year_2021_sales:2200
                └─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:5000 pivot_year_2021_sales:2200
                · ├── LEAF hidden id:5 pivot_year_2020_sales:2000 pivot_year_2021_sales:2000
                · ├── LEAF hidden id:"5b" pivot_year_2020_sales:3000 pivot_year_2021_sales:3000
                · └── LEAF hidden id:6 pivot_year_2020_sales:2200 pivot_year_2021_sales:2200
            `);

        const pivotColumns = api.getPivotResultColumns()!;
        const pivotCol2020 = pivotColumns.find((col) => col.getColId().includes('2020_sales'))!;

        // USA 2020: [2000, 3000] total=5000. Set to 10000, percentage: 2000/5000*10000=4000, 3000/5000*10000=6000
        const usaNode = api.getRowNode('row-group-country-USA')!;
        usaNode.setDataValue(pivotCol2020, 10000, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('5')?.data?.sales).toBe(4000);
        expect(api.getRowNode('5b')?.data?.sales).toBe(6000);
        // 2021 untouched
        expect(api.getRowNode('6')?.data?.sales).toBe(2200);
        await new GridRows(
            api,
            `percentage distribution on pivot leaf group scales pivot-matching children final state`
        ).check(`
            ROOT id:ROOT_NODE_ID pivot_year_2020_sales:10000 pivot_year_2021_sales:2200
            └─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:10000 pivot_year_2021_sales:2200
            · ├── LEAF hidden id:5 pivot_year_2020_sales:4000 pivot_year_2021_sales:4000
            · ├── LEAF hidden id:"5b" pivot_year_2020_sales:6000 pivot_year_2021_sales:6000
            · └── LEAF hidden id:6 pivot_year_2020_sales:2200 pivot_year_2021_sales:2200
        `);
    });

    test('options object on colDef works with pivot mode', async () => {
        const api = await pivotGridsManager.createGridAndWait('pivot-opts', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                {
                    field: 'sales',
                    aggFunc: 'sum',
                    hide: true,
                    editable: true,
                    groupRowEditable: true,
                    groupRowValueSetter: { distribution: 'percentage' },
                },
            ],
            pivotMode: true,
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '5', region: 'Americas', country: 'USA', year: 2020, sales: 2000 },
                { id: '5b', region: 'Americas', country: 'USA', year: 2020, sales: 3000 },
                { id: '6', region: 'Americas', country: 'USA', year: 2021, sales: 2200 },
            ],
        });
        await new GridColumns(api, `options object on colDef works with pivot mode setup`).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├─┬ "2020" GROUP
            │ └── pivot_year_2020_sales "Sales" width:200 columnGroupShow:open editable
            └─┬ "2021" GROUP
              └── pivot_year_2021_sales "Sales" width:200 columnGroupShow:open editable
        `);
        await new GridRows(api, `options object on colDef works with pivot mode setup`).check(`
            ROOT id:ROOT_NODE_ID pivot_year_2020_sales:5000 pivot_year_2021_sales:2200
            └─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:5000 pivot_year_2021_sales:2200
            · ├── LEAF hidden id:5 pivot_year_2020_sales:2000 pivot_year_2021_sales:2000
            · ├── LEAF hidden id:"5b" pivot_year_2020_sales:3000 pivot_year_2021_sales:3000
            · └── LEAF hidden id:6 pivot_year_2020_sales:2200 pivot_year_2021_sales:2200
        `);

        const pivotColumns = api.getPivotResultColumns()!;
        const pivotCol2020 = pivotColumns.find((col) => col.getColId().includes('2020_sales'))!;

        const usaNode = api.getRowNode('row-group-country-USA')!;
        usaNode.setDataValue(pivotCol2020, 10000, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('5')?.data?.sales).toBe(4000);
        expect(api.getRowNode('5b')?.data?.sales).toBe(6000);
        expect(api.getRowNode('6')?.data?.sales).toBe(2200);
        await new GridRows(api, `options object on colDef works with pivot mode final state`).check(`
            ROOT id:ROOT_NODE_ID pivot_year_2020_sales:10000 pivot_year_2021_sales:2200
            └─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:10000 pivot_year_2021_sales:2200
            · ├── LEAF hidden id:5 pivot_year_2020_sales:4000 pivot_year_2021_sales:4000
            · ├── LEAF hidden id:"5b" pivot_year_2020_sales:6000 pivot_year_2021_sales:6000
            · └── LEAF hidden id:6 pivot_year_2020_sales:2200 pivot_year_2021_sales:2200
        `);
    });
});

describe('distributeGroupValue with refreshAfterGroupEdit', () => {
    test('distribution works correctly after rows move between groups', async () => {
        const api = await gridsManager.createGridAndWait('distribute-refresh-after-group-edit', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
            groupDisplayType: 'custom',
            columnDefs: [
                { colId: 'group', headerName: 'Group', cellRenderer: 'agGroupCellRenderer' },
                { field: 'region', rowGroup: true, editable: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                {
                    colId: 'amount',
                    field: 'amount',
                    aggFunc: 'sum',
                    editable: true,
                    groupRowEditable: true,
                    groupRowValueSetter: distributeGroupValue,
                },
            ],
            rowData: [
                { id: 'a1', region: 'A', country: 'X', amount: 10 },
                { id: 'a2', region: 'A', country: 'X', amount: 20 },
                { id: 'b1', region: 'B', country: 'Y', amount: 30 },
            ],
            refreshAfterGroupEdit: true,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-A amount:30
            │ └─┬ LEAF_GROUP id:row-group-region-A-country-X amount:30
            │ · ├── LEAF id:a1 region:"A" country:"X" amount:10
            │ · └── LEAF id:a2 region:"A" country:"X" amount:20
            └─┬ filler id:row-group-region-B amount:30
            · └─┬ LEAF_GROUP id:row-group-region-B-country-Y amount:30
            · · └── LEAF id:b1 region:"B" country:"Y" amount:30
        `);

        // Move a2 from region A to region B by editing the row group column
        api.getRowNode('a2')!.setDataValue('region', 'B');
        await asyncSetTimeout(2);

        await new GridRows(api, 'after row move').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-A amount:10
            │ └─┬ LEAF_GROUP id:row-group-region-A-country-X amount:10
            │ · └── LEAF id:a1 region:"A" country:"X" amount:10
            └─┬ filler id:row-group-region-B amount:50
            · ├─┬ LEAF_GROUP id:row-group-region-B-country-Y amount:30
            · │ └── LEAF id:b1 region:"B" country:"Y" amount:30
            · └─┬ LEAF_GROUP id:row-group-region-B-country-X amount:20
            · · └── LEAF id:a2 region:"B" country:"X" amount:20
        `);

        // Now distribute 100 to the region B filler group (has 2 child groups: Y=30, X=20)
        const regionBNode = api.getRowNode('row-group-region-B')!;
        regionBNode.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        await new GridRows(api, 'after distribution on moved group').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-A amount:10
            │ └─┬ LEAF_GROUP id:row-group-region-A-country-X amount:10
            │ · └── LEAF id:a1 region:"A" country:"X" amount:10
            └─┬ filler id:row-group-region-B amount:100
            · ├─┬ LEAF_GROUP id:row-group-region-B-country-Y amount:50
            · │ └── LEAF id:b1 region:"B" country:"Y" amount:50
            · └─┬ LEAF_GROUP id:row-group-region-B-country-X amount:50
            · · └── LEAF id:a2 region:"B" country:"X" amount:50
        `);
    });
});
