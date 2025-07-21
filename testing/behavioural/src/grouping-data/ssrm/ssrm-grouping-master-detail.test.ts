import { ServerSideRowModelModule } from 'ag-grid-enterprise';
import { MasterDetailModule, TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, ssrmExpandAndLoadAll } from '../../test-utils';
import type { GridRowsOptions } from '../../test-utils';

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

    const rowData = [
        {
            id: 'A',
            group: '',
        },
        {
            id: 'B',
            group: 'A',
            records: [{ name: 'R1' }, { name: 'R2' }],
        },
        {
            id: 'C',
            group: 'A',
            records: [{ name: 'R3' }],
        },
        {
            id: 'D',
            group: '',
        },
        {
            id: 'E',
            group: 'D',
            records: [{ name: 'R4' }],
        },
        {
            id: 'F',
            group: 'D',
            records: [{ name: 'R5' }, { name: 'R6' }],
        },
        {
            id: 'G',
            group: 'D/E',
            records: [{ name: 'R7' }],
        },
        {
            id: 'H',
            group: 'D/E',
            records: [{ name: 'R8' }, { name: 'R9' }],
        },
        {
            id: 'I',
            group: 'D/E',
        },
    ];

    test('grouping master-detail SSRM', async () => {
        // Minimal static data for grouping and master detail
        const api = gridsManager.createGrid('ssrmGrid', {
            columnDefs: [{ field: 'group', rowGroup: true }, { field: 'id' }],
            rowModelType: 'serverSide',
            getRowId: (params) => {
                return params.data.id;
            },
            masterDetail: true,
            autoGroupColumnDef: { headerName: 'Group', field: 'group' },
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
            isServerSideGroup: (dataItem) => !!dataItem.group,
            serverSideDatasource: {
                getRows: (params) => {
                    // Grouping: use request.groupKeys to filter data
                    const groupKeys = params.request.groupKeys;
                    const group = groupKeys.join('/');
                    params.success({ rowData: rowData.filter((r) => r.group === group) });
                },
            },
        });

        await ssrmExpandAndLoadAll(api);

        const gridRowsOptions: GridRowsOptions = { columns: true };
        const gridRows = new GridRows(api, 'initial', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP group:"A"
            │ ├── A1 master id:A1 group:"A"
            │ │ └─┬ detail id:detail_A1 id:"A1"
            │ │ · └─┬ ROOT id:ROOT_NODE_ID
            │ │ · · ├── LEAF id:X name:"X"
            │ │ · · └── LEAF id:Y name:"Y"
            │ └── A2 LEAF id:A2 group:"A"
            └─┬ B GROUP group:"B"
            · └── B1 master id:B1 group:"B"
            ·   └─┬ detail id:detail_B1 id:"B1"
            ·     └─┬ ROOT id:ROOT_NODE_ID
            ·       └── LEAF id:Z name:"Z"
        `);
    });
});
