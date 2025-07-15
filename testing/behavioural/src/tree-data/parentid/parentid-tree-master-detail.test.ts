import { ClientSideRowModelModule } from 'ag-grid-community';
import { MasterDetailModule, TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager } from '../../test-utils';
import type { GridRowsOptions } from '../../test-utils';

describe('ag-grid parentId tree with master detail', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TreeDataModule, MasterDetailModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('tree grouping', async () => {
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

        const gridRowsOptions: GridRowsOptions = {
            checkDom: false,
            columns: true,
        };

        let gridRows = new GridRows(api, 'initial', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A" id:"A"
            │ ├─┬ B master id:B ag-Grid-AutoColumn:"B" id:"B"
            │ │ └─┬ detail id:detail_B ag-Grid-AutoColumn:undefined id:"B"
            │ │ · └─┬ ROOT id:ROOT_NODE_ID
            │ │ · · ├── LEAF id:X0 name:"X0"
            │ │ · · └── LEAF id:Y0 name:"Y0"
            │ └── C LEAF id:C ag-Grid-AutoColumn:"C" id:"C"
            └─┬ D master id:D ag-Grid-AutoColumn:"D" id:"D"
            · ├─┬ detail id:detail_D ag-Grid-AutoColumn:undefined id:"D"
            · │ └─┬ ROOT id:ROOT_NODE_ID
            · │ · ├── LEAF id:X1 name:"X1"
            · │ · └── LEAF id:Y1 name:"Y1"
            · └─┬ E master id:E ag-Grid-AutoColumn:"E" id:"E"
            · · ├─┬ detail id:detail_E ag-Grid-AutoColumn:undefined id:"E"
            · · │ └─┬ ROOT id:ROOT_NODE_ID
            · · │ · ├── LEAF id:X2 name:"X2"
            · · │ · └── LEAF id:Y2 name:"Y2"
            · · ├─┬ F master id:F ag-Grid-AutoColumn:"F" id:"F"
            · · │ ├─┬ detail id:detail_F ag-Grid-AutoColumn:undefined id:"F"
            · · │ │ └─┬ ROOT id:ROOT_NODE_ID
            · · │ │ · └── LEAF id:X3 name:"X3"
            · · │ ├── F1 LEAF id:F1 ag-Grid-AutoColumn:"F1" id:"F1"
            · · │ └── F2 LEAF id:F2 ag-Grid-AutoColumn:"F2" id:"F2"
            · · ├── E1 LEAF id:E1 ag-Grid-AutoColumn:"E1" id:"E1"
            · · └── E2 LEAF id:E2 ag-Grid-AutoColumn:"E2" id:"E2"
        `);

        api.setGridOption('masterDetail', false);

        gridRows = new GridRows(api, 'master detail false', gridRowsOptions);
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

        gridRows = new GridRows(api, 'initial', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A" id:"A"
            │ ├─┬ B master id:B ag-Grid-AutoColumn:"B" id:"B"
            │ │ └─┬ detail id:detail_B ag-Grid-AutoColumn:undefined id:"B"
            │ │ · └─┬ ROOT id:ROOT_NODE_ID
            │ │ · · ├── LEAF id:X0 name:"X0"
            │ │ · · └── LEAF id:Y0 name:"Y0"
            │ └── C LEAF id:C ag-Grid-AutoColumn:"C" id:"C"
            └─┬ D master id:D ag-Grid-AutoColumn:"D" id:"D"
            · ├─┬ detail id:detail_D ag-Grid-AutoColumn:undefined id:"D"
            · │ └─┬ ROOT id:ROOT_NODE_ID
            · │ · ├── LEAF id:X1 name:"X1"
            · │ · └── LEAF id:Y1 name:"Y1"
            · └─┬ E master id:E ag-Grid-AutoColumn:"E" id:"E"
            · · ├─┬ detail id:detail_E ag-Grid-AutoColumn:undefined id:"E"
            · · │ └─┬ ROOT id:ROOT_NODE_ID
            · · │ · ├── LEAF id:X2 name:"X2"
            · · │ · └── LEAF id:Y2 name:"Y2"
            · · ├─┬ F master id:F ag-Grid-AutoColumn:"F" id:"F"
            · · │ ├─┬ detail id:detail_F ag-Grid-AutoColumn:undefined id:"F"
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

        gridRows = new GridRows(api, 'initial', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A" id:"A"
            │ ├─┬ B master id:B ag-Grid-AutoColumn:"B" id:"B"
            │ │ └─┬ detail id:detail_B ag-Grid-AutoColumn:undefined id:"B"
            │ │ · └─┬ ROOT id:ROOT_NODE_ID
            │ │ · · ├── LEAF id:X0 name:"X0"
            │ │ · · └── LEAF id:Y0 name:"Y0"
            │ └── C LEAF id:C ag-Grid-AutoColumn:"C" id:"C"
            └─┬ D master id:D ag-Grid-AutoColumn:"D" id:"D"
            · ├─┬ detail id:detail_D ag-Grid-AutoColumn:undefined id:"D"
            · │ └─┬ ROOT id:ROOT_NODE_ID
            · │ · ├── LEAF id:X1 name:"X1"
            · │ · └── LEAF id:Y1 name:"Y1"
            · └─┬ E GROUP id:E ag-Grid-AutoColumn:"E" id:"E"
            · · ├── E1 LEAF id:E1 ag-Grid-AutoColumn:"E1" id:"E1"
            · · ├── E2 LEAF id:E2 ag-Grid-AutoColumn:"E2" id:"E2"
            · · └─┬ G master id:G ag-Grid-AutoColumn:"G" id:"G"
            · · · └─┬ detail id:detail_G ag-Grid-AutoColumn:undefined id:"G"
            · · · · └─┬ ROOT id:ROOT_NODE_ID
            · · · · · ├── LEAF id:X4 name:"X4"
            · · · · · └── LEAF id:Y4 name:"Y4"
        `);

        expect(isRowMasterCallCount).toBe(22);
    });
});
