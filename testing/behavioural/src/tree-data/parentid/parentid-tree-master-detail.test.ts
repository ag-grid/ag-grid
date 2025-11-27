import { ClientSideRowModelModule } from 'ag-grid-community';
import { MasterDetailModule, TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager } from '../../test-utils';

describe('ag-grid parentId tree with master detail', () => {
    test('nested groups expansion and callback calls', async () => {
        // Tree: A (group)
        //   └─ B (group)
        //        └─ C (master/leaf)
        const rowData = [{ id: 'A' }, { id: 'B', parentId: 'A' }, { id: 'C', parentId: 'B', records: [{ name: 'X' }] }];
        const callbackCalls: { key: string; level: number }[] = [];
        const api = gridsManager.createGrid('nestedGroups', {
            columnDefs: [{ field: 'id' }],
            treeData: true,
            treeDataParentIdField: 'parentId',
            groupDefaultExpanded: 0,
            rowData,
            getRowId: (params) => params.data.id,
            masterDetail: true,
            detailCellRendererParams: {
                detailGridOptions: {
                    columnDefs: [{ field: 'name' }],
                    getRowId: ({ data }) => data.name,
                },
                getDetailRowData: (params) => {
                    params.successCallback(params.data.records);
                },
            },
            isRowMaster: (dataItem) => !!dataItem?.records?.length,
            isGroupOpenByDefault: (params) => {
                callbackCalls.push({ key: params.key, level: params.level });
                // Expand only top-level group
                return params.level === 0;
            },
        });
        // Only top-level group 'A' should be expanded, nested group 'B' and leaf/master 'C' should not
        expect(api.getRowNode('A')?.expanded).toBe(true); // top-level group
        expect(api.getRowNode('B')?.expanded).toBe(false); // nested group
        expect(api.getRowNode('C')?.expanded).toBe(false); // leaf/master

        // Verify callback was called for the correct nodes and levels
        // Should be called for 'A' (level 0) and 'B' (level 1), not for leaf/master 'C'
        expect(callbackCalls).toEqual([
            { key: 'A', level: 0 },
            { key: 'B', level: 1 },
        ]);
    });
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TreeDataModule, MasterDetailModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('tree master-detail', async () => {
        let isRowMasterCallCount = 0;
        const rowData = [
            { id: 'F1', parentId: 'F' },
            { id: 'A' },
            {
                id: 'B',
                parentId: 'A',
                records: [{ name: 'X0' }, { name: 'Y0' }],
            },
            { id: 'C', parentId: 'A' },
            { id: 'D', records: [{ name: 'X1' }, { name: 'Y1' }] },
            {
                id: 'E',
                parentId: 'D',
                records: [{ name: 'X2' }, { name: 'Y2' }],
            },
            {
                id: 'F',
                parentId: 'E',
                records: [{ name: 'X3' }],
            },
            { id: 'E1', parentId: 'E' },
            { id: 'F2', parentId: 'F' },
            { id: 'E2', parentId: 'E' },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'id' }],
            treeData: true,
            treeDataParentIdField: 'parentId',
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            masterDetail: true,
            detailCellRendererParams: {
                detailGridOptions: {
                    columnDefs: [{ field: 'name' }],
                    getRowId: ({ data }) => data.name,
                },
                getDetailRowData: (params) => {
                    params.successCallback(params.data.records);
                },
            },
            isRowMaster: (dataItem) => {
                ++isRowMasterCallCount;
                return dataItem?.records?.length;
            },
        });

        let gridRows = new GridRows(api, 'initial');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A" id:"A"
            │ ├─┬ B master id:B ag-Grid-AutoColumn:"B" id:"B"
            │ │ └─┬ detail id:detail_B id:"B"
            │ │ · └─┬ ROOT id:ROOT_NODE_ID
            │ │ · · ├── LEAF id:X0 name:"X0"
            │ │ · · └── LEAF id:Y0 name:"Y0"
            │ └── C LEAF id:C ag-Grid-AutoColumn:"C" id:"C"
            └─┬ D master-GROUP id:D ag-Grid-AutoColumn:"D" id:"D"
            · ├─┬ detail id:detail_D id:"D"
            · │ └─┬ ROOT id:ROOT_NODE_ID
            · │ · ├── LEAF id:X1 name:"X1"
            · │ · └── LEAF id:Y1 name:"Y1"
            · └─┬ E master-GROUP id:E ag-Grid-AutoColumn:"E" id:"E"
            · · ├─┬ detail id:detail_E id:"E"
            · · │ └─┬ ROOT id:ROOT_NODE_ID
            · · │ · ├── LEAF id:X2 name:"X2"
            · · │ · └── LEAF id:Y2 name:"Y2"
            · · ├─┬ F master-GROUP id:F ag-Grid-AutoColumn:"F" id:"F"
            · · │ ├─┬ detail id:detail_F id:"F"
            · · │ │ └─┬ ROOT id:ROOT_NODE_ID
            · · │ │ · └── LEAF id:X3 name:"X3"
            · · │ ├── F1 LEAF id:F1 ag-Grid-AutoColumn:"F1" id:"F1"
            · · │ └── F2 LEAF id:F2 ag-Grid-AutoColumn:"F2" id:"F2"
            · · ├── E1 LEAF id:E1 ag-Grid-AutoColumn:"E1" id:"E1"
            · · └── E2 LEAF id:E2 ag-Grid-AutoColumn:"E2" id:"E2"
        `);

        api.setGridOption('masterDetail', false);

        gridRows = new GridRows(api, 'masterDetail=false');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A" id:"A"
            │ ├── B LEAF id:B ag-Grid-AutoColumn:"B" id:"B"
            │ └── C LEAF id:C ag-Grid-AutoColumn:"C" id:"C"
            └─┬ D GROUP id:D ag-Grid-AutoColumn:"D" id:"D"
            · └─┬ E GROUP id:E ag-Grid-AutoColumn:"E" id:"E"
            · · ├─┬ F GROUP id:F ag-Grid-AutoColumn:"F" id:"F"
            · · │ ├── F1 LEAF id:F1 ag-Grid-AutoColumn:"F1" id:"F1"
            · · │ └── F2 LEAF id:F2 ag-Grid-AutoColumn:"F2" id:"F2"
            · · ├── E1 LEAF id:E1 ag-Grid-AutoColumn:"E1" id:"E1"
            · · └── E2 LEAF id:E2 ag-Grid-AutoColumn:"E2" id:"E2"
        `);

        api.setGridOption('masterDetail', true);

        gridRows = new GridRows(api, 'masterDetail=true');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A" id:"A"
            │ ├─┬ B master id:B ag-Grid-AutoColumn:"B" id:"B"
            │ │ └─┬ detail id:detail_B id:"B"
            │ │ · └─┬ ROOT id:ROOT_NODE_ID
            │ │ · · ├── LEAF id:X0 name:"X0"
            │ │ · · └── LEAF id:Y0 name:"Y0"
            │ └── C LEAF id:C ag-Grid-AutoColumn:"C" id:"C"
            └─┬ D master-GROUP id:D ag-Grid-AutoColumn:"D" id:"D"
            · ├─┬ detail id:detail_D id:"D"
            · │ └─┬ ROOT id:ROOT_NODE_ID
            · │ · ├── LEAF id:X1 name:"X1"
            · │ · └── LEAF id:Y1 name:"Y1"
            · └─┬ E master-GROUP id:E ag-Grid-AutoColumn:"E" id:"E"
            · · ├─┬ detail id:detail_E id:"E"
            · · │ └─┬ ROOT id:ROOT_NODE_ID
            · · │ · ├── LEAF id:X2 name:"X2"
            · · │ · └── LEAF id:Y2 name:"Y2"
            · · ├─┬ F master-GROUP id:F ag-Grid-AutoColumn:"F" id:"F"
            · · │ ├─┬ detail id:detail_F id:"F"
            · · │ │ └─┬ ROOT id:ROOT_NODE_ID
            · · │ │ · └── LEAF id:X3 name:"X3"
            · · │ ├── F1 LEAF id:F1 ag-Grid-AutoColumn:"F1" id:"F1"
            · · │ └── F2 LEAF id:F2 ag-Grid-AutoColumn:"F2" id:"F2"
            · · ├── E1 LEAF id:E1 ag-Grid-AutoColumn:"E1" id:"E1"
            · · └── E2 LEAF id:E2 ag-Grid-AutoColumn:"E2" id:"E2"
        `);

        api.applyTransaction({
            add: [{ id: 'G', parentId: 'E', records: [{ name: 'X4' }, { name: 'Y4' }] }],
            remove: [{ id: 'F2' }, { id: 'F' }, { id: 'F1' }],
            update: [{ id: 'E', parentId: 'D' }],
        });

        gridRows = new GridRows(api, 'initial');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A" id:"A"
            │ ├─┬ B master id:B ag-Grid-AutoColumn:"B" id:"B"
            │ │ └─┬ detail id:detail_B id:"B"
            │ │ · └─┬ ROOT id:ROOT_NODE_ID
            │ │ · · ├── LEAF id:X0 name:"X0"
            │ │ · · └── LEAF id:Y0 name:"Y0"
            │ └── C LEAF id:C ag-Grid-AutoColumn:"C" id:"C"
            └─┬ D master-GROUP id:D ag-Grid-AutoColumn:"D" id:"D"
            · ├─┬ detail id:detail_D id:"D"
            · │ └─┬ ROOT id:ROOT_NODE_ID
            · │ · ├── LEAF id:X1 name:"X1"
            · │ · └── LEAF id:Y1 name:"Y1"
            · └─┬ E GROUP id:E ag-Grid-AutoColumn:"E" id:"E"
            · · ├── E1 LEAF id:E1 ag-Grid-AutoColumn:"E1" id:"E1"
            · · ├── E2 LEAF id:E2 ag-Grid-AutoColumn:"E2" id:"E2"
            · · └─┬ G master id:G ag-Grid-AutoColumn:"G" id:"G"
            · · · └─┬ detail id:detail_G id:"G"
            · · · · └─┬ ROOT id:ROOT_NODE_ID
            · · · · · ├── LEAF id:X4 name:"X4"
            · · · · · └── LEAF id:Y4 name:"Y4"
        `);

        expect(isRowMasterCallCount).toBe(22);
    });

    test('leaf master details use groupDefaultExpanded', async () => {
        const rowData = [
            { id: 'A', records: [{ name: 'X' }] },
            { id: 'B', parentId: 'A' },
        ];
        const api = gridsManager.createGrid('leafGrid', {
            columnDefs: [{ field: 'id' }],
            treeData: true,
            treeDataParentIdField: 'parentId',
            groupDefaultExpanded: 0,
            rowData,
            getRowId: (params) => params.data.id,
            masterDetail: true,
            detailCellRendererParams: {
                detailGridOptions: {
                    columnDefs: [{ field: 'name' }],
                    getRowId: ({ data }) => data.name,
                },
                getDetailRowData: (params) => {
                    params.successCallback(params.data.records);
                },
            },
            isRowMaster: (dataItem) => !!dataItem?.records?.length,
        });
        // With groupDefaultExpanded: 0, all groups are collapsed by default
        expect(api.getRowNode('A')?.expanded).toBe(false); // group/root 'A'
        expect(api.getRowNode('B')?.expanded).toBe(false); // leaf/master 'B'
    });

    test('group nodes use isGroupOpenByDefault callback', async () => {
        const rowData = [{ id: 'A' }, { id: 'B', parentId: 'A', records: [{ name: 'X' }] }];
        const api = gridsManager.createGrid('groupGrid', {
            columnDefs: [{ field: 'id' }],
            treeData: true,
            treeDataParentIdField: 'parentId',
            groupDefaultExpanded: 0,
            rowData,
            getRowId: (params) => params.data.id,
            masterDetail: true,
            detailCellRendererParams: {
                detailGridOptions: {
                    columnDefs: [{ field: 'name' }],
                    getRowId: ({ data }) => data.name,
                },
                getDetailRowData: (params) => {
                    params.successCallback(params.data.records);
                },
            },
            isRowMaster: (dataItem) => !!dataItem?.records?.length,
            isGroupOpenByDefault: ({ key }) => key === 'A',
        });
        // Group node 'A' should be expanded by callback, leaf/master 'B' should not
        expect(api.getRowNode('A')?.expanded).toBe(true); // group 'A'
        expect(api.getRowNode('B')?.expanded).toBe(false); // leaf/master 'B'
    });

    test('group nodes fallback to groupDefaultExpanded if no callback', async () => {
        const rowData = [{ id: 'A' }, { id: 'B', parentId: 'A', records: [{ name: 'X' }] }];
        const api = gridsManager.createGrid('groupGridDefault', {
            columnDefs: [{ field: 'id' }],
            treeData: true,
            treeDataParentIdField: 'parentId',
            groupDefaultExpanded: 1,
            rowData,
            getRowId: (params) => params.data.id,
            masterDetail: true,
            detailCellRendererParams: {
                detailGridOptions: {
                    columnDefs: [{ field: 'name' }],
                    getRowId: ({ data }) => data.name,
                },
                getDetailRowData: (params) => {
                    params.successCallback(params.data.records);
                },
            },
            isRowMaster: (dataItem) => !!dataItem?.records?.length,
        });
        // With groupDefaultExpanded: 1, only top-level group is expanded, leaf/master is not
        expect(api.getRowNode('A')?.expanded).toBe(true); // group 'A'
        expect(api.getRowNode('B')?.expanded).toBe(false); // leaf/master 'B'
    });
});
