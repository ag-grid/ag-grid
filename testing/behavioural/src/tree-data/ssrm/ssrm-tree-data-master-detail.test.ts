import { MasterDetailModule, ServerSideRowModelModule, TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, ssrmExpandAndLoadAll } from '../../test-utils';

describe('ag-grid SSRM treeData with master detail', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelModule, TreeDataModule, MasterDetailModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('tree master-detail SSRM', async () => {
        const rowData = [
            {
                id: 'A',
                children: [
                    {
                        id: 'B',
                        records: [{ name: 'X0' }, { name: 'Y0' }],
                    },
                    {
                        id: 'C',
                    },
                ],
            },
            {
                id: 'D',
                records: [{ name: 'X1' }, { name: 'Y1' }],
                children: [
                    {
                        id: 'E',
                        records: [{ name: 'X2' }, { name: 'Y2' }],
                        children: [
                            {
                                id: 'F',
                                records: [{ name: 'X3' }],
                                children: [{ id: 'F1' }, { id: 'F2' }],
                            },
                            { id: 'E1' },
                            { id: 'E2' },
                        ],
                    },
                ],
            },
        ];

        const api = gridsManager.createGrid('ssrmGrid', {
            columnDefs: [{ field: 'id' }],
            treeData: true,
            rowModelType: 'serverSide',
            getRowId: (params) => params.data.id,
            masterDetail: true,
            isServerSideGroup: (dataItem) => !!dataItem.children?.length,
            getServerSideGroupKey: (dataItem) => dataItem.id,
            autoGroupColumnDef: {
                headerName: 'Group',
                field: 'id',
            },
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
            serverSideDatasource: {
                getRows: (params) => {
                    const parentNode = params.parentNode;
                    params.success({
                        rowData: parentNode.parent ? parentNode.data?.children ?? [] : rowData,
                    });
                },
            },
        });

        await ssrmExpandAndLoadAll(api);

        const gridRows = new GridRows(api, '');
        await gridRows.check(`
            ROOT id:<no-id>
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A" id:"A"
            │ ├─┬ master id:B ag-Grid-AutoColumn:"B" id:"B"
            │ │ └─┬ detail id:detail_B ag-Grid-AutoColumn:"B" id:"B"
            │ │ · └─┬ ROOT id:ROOT_NODE_ID
            │ │ · · ├── LEAF id:X0 name:"X0"
            │ │ · · └── LEAF id:Y0 name:"Y0"
            │ └── LEAF id:C ag-Grid-AutoColumn:"C" id:"C"
            └─┬ D master-GROUP id:D ag-Grid-AutoColumn:"D" id:"D"
            · ├─┬ detail collapsed id:detail_D ag-Grid-AutoColumn:"D" id:"D"
            · │ └─┬ ROOT id:ROOT_NODE_ID
            · │ · ├── LEAF id:X1 name:"X1"
            · │ · └── LEAF id:Y1 name:"Y1"
            · └─┬ E master-GROUP id:E ag-Grid-AutoColumn:"E" id:"E"
            · · ├─┬ detail collapsed id:detail_E ag-Grid-AutoColumn:"E" id:"E"
            · · │ └─┬ ROOT id:ROOT_NODE_ID
            · · │ · ├── LEAF id:X2 name:"X2"
            · · │ · └── LEAF id:Y2 name:"Y2"
            · · ├─┬ F master-GROUP id:F ag-Grid-AutoColumn:"F" id:"F"
            · · │ ├─┬ detail collapsed id:detail_F ag-Grid-AutoColumn:"F" id:"F"
            · · │ │ └─┬ ROOT id:ROOT_NODE_ID
            · · │ │ · └── LEAF id:X3 name:"X3"
            · · │ ├── LEAF id:F1 ag-Grid-AutoColumn:"F1" id:"F1"
            · · │ └── LEAF id:F2 ag-Grid-AutoColumn:"F2" id:"F2"
            · · ├── LEAF id:E1 ag-Grid-AutoColumn:"E1" id:"E1"
            · · └── LEAF id:E2 ag-Grid-AutoColumn:"E2" id:"E2"
        `);
    });
});
