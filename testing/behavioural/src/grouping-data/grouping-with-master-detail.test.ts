import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { MasterDetailModule, RowGroupingModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager } from '../test-utils';

describe('ag-grid grouping with master detail', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, MasterDetailModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('basic grouping with master detail', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'year' }, { field: 'sales' }],
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            masterDetail: true,
            detailCellRendererParams: {
                detailGridOptions: {
                    columnDefs: [{ field: 'orderId' }, { field: 'amount' }],
                },
                getDetailRowData: (params: any) => {
                    params.successCallback(params.data.orders || []);
                },
            },
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        api.applyTransaction({
            add: [
                {
                    id: '1',
                    country: 'Ireland',
                    year: 2020,
                    sales: 1000,
                    orders: [
                        { orderId: 'A', amount: 500 },
                        { orderId: 'B', amount: 500 },
                    ],
                },
                { id: '2', country: 'Ireland', year: 2021, sales: 1200, orders: [{ orderId: 'C', amount: 1200 }] },
                { id: '3', country: 'USA', year: 2020, sales: 2000, orders: [{ orderId: 'D', amount: 2000 }] },
                { id: '4', country: 'USA', year: 2021, sales: 2200, orders: [{ orderId: 'E', amount: 2200 }] },
                { id: '5', country: 'Germany', year: 2020, sales: 1500, orders: [{ orderId: 'F', amount: 1500 }] },
            ],
        });

        const gridRows = new GridRows(api, 'basic grouping with master detail');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ master id:1 country:"Ireland" year:2020 sales:1000
            │ │ └─┬ detail id:detail_1 country:"Ireland" year:2020 sales:1000
            │ │ · └─┬ ROOT id:ROOT_NODE_ID
            │ │ · · ├── LEAF id:0 orderId:"A" amount:500
            │ │ · · └── LEAF id:1 orderId:"B" amount:500
            │ └─┬ master id:2 country:"Ireland" year:2021 sales:1200
            │ · └─┬ detail id:detail_2 country:"Ireland" year:2021 sales:1200
            │ · · └─┬ ROOT id:ROOT_NODE_ID
            │ · · · └── LEAF id:0 orderId:"C" amount:1200
            ├─┬ LEAF_GROUP id:row-group-country-USA ag-Grid-AutoColumn:"USA"
            │ ├─┬ master id:3 country:"USA" year:2020 sales:2000
            │ │ └─┬ detail id:detail_3 country:"USA" year:2020 sales:2000
            │ │ · └─┬ ROOT id:ROOT_NODE_ID
            │ │ · · └── LEAF id:0 orderId:"D" amount:2000
            │ └─┬ master id:4 country:"USA" year:2021 sales:2200
            │ · └─┬ detail id:detail_4 country:"USA" year:2021 sales:2200
            │ · · └─┬ ROOT id:ROOT_NODE_ID
            │ · · · └── LEAF id:0 orderId:"E" amount:2200
            └─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
            · └─┬ master id:5 country:"Germany" year:2020 sales:1500
            · · └─┬ detail id:detail_5 country:"Germany" year:2020 sales:1500
            · · · └─┬ ROOT id:ROOT_NODE_ID
            · · · · └── LEAF id:0 orderId:"F" amount:1500
        `);
    });
});
