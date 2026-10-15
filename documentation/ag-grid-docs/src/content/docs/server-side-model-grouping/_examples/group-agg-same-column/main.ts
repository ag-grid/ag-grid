import type { GridApi, GridOptions, IServerSideDatasource } from 'ag-grid-community';
import { ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { ColumnsToolPanelModule, RowGroupingModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { FakeServer } from './fakeServer';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ColumnsToolPanelModule, RowGroupingModule, ServerSideRowModelModule]);

let gridApi: GridApi<IOlympicData>;
const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'gold', rowGroup: true, aggFunc: 'sum', sort: 'asc' },
        { field: 'silver', aggFunc: 'sum' },
        { field: 'bronze', aggFunc: 'sum' },
        { field: 'country' },
        { field: 'sport' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 120,
        enableRowGroup: true,
        enableValue: true,
    },
    autoGroupColumnDef: {
        flex: 1,
        minWidth: 120,
        field: 'athlete',
    },
    sideBar: 'columns',

    // the server returns the aggregate of the grouped column as `<aggFunc>_<colId>`, e.g. `sum_gold`
    getServerSideGroupAggValue: ({ data, column }) => data[`${column.getAggFunc()}_${column.getColId()}`],

    rowModelType: 'serverSide',
};

function getServerSideDatasource(server: any): IServerSideDatasource {
    return {
        getRows: (params) => {
            console.log('[Datasource] - rows requested by grid: ', params.request);

            const response = server.getData(params.request);

            // adding delay to simulate real server call
            setTimeout(() => {
                if (response.success) {
                    // call the success callback
                    params.success({ rowData: response.rows, rowCount: response.lastRow });
                } else {
                    // inform the grid request failed
                    params.fail();
                }
            }, 1000);
        },
    };
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then(function (data) {
            // athletes without a gold medal are left out, so no group has a sum of 0
            const fakeServer = new FakeServer(data.filter((row: IOlympicData) => row.gold > 0));

            // create datasource with a reference to the fake server
            const datasource = getServerSideDatasource(fakeServer);

            // register the datasource with the grid
            gridApi!.setGridOption('serverSideDatasource', datasource);
        });
});
