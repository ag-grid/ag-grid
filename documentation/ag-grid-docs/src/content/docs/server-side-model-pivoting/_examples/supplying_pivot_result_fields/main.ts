import { GridApi, GridOptions, IServerSideDatasource, createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { ColumnsToolPanelModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';
import { RowGroupingModule } from 'ag-grid-enterprise';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';

import { FakeServer } from './fakeServer';

ModuleRegistry.registerModules([ColumnsToolPanelModule, MenuModule, RowGroupingModule, ServerSideRowModelModule]);

let gridApi: GridApi<IOlympicData>;
const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'country', rowGroup: true },
        { field: 'year', pivot: true }, // pivot on 'year'
        { field: 'gold', aggFunc: 'sum' },
        { field: 'silver', aggFunc: 'sum' },
        { field: 'bronze', aggFunc: 'sum' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    autoGroupColumnDef: {
        minWidth: 200,
    },

    // use the server-side row model
    rowModelType: 'serverSide',

    // enable pivoting
    pivotMode: true,

    // specify the field separator, e.g. '2000_gold' should be '_' which is the default
    serverSidePivotResultFieldSeparator: '_',

    suppressAggFuncInHeader: true,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data) => {
            // setup the fake server with entire dataset
            const fakeServer = new FakeServer(data);

            // create datasource with a reference to the fake server
            const datasource = getServerSideDatasource(fakeServer);

            // register the datasource with the grid
            gridApi!.setGridOption('serverSideDatasource', datasource);
        });
});

function getServerSideDatasource(server: any): IServerSideDatasource {
    return {
        getRows: (params) => {
            console.log('[Datasource] - rows requested by grid: ', params.request);

            // get data for request from our fake server
            const response = server.getData(params.request);
            // simulating real server call with a 500ms delay
            setTimeout(() => {
                if (response.success) {
                    // supply data to grid
                    console.log('[Datasource] - pivotResultFields to be set in grid: ', response.pivotFields);
                    params.success({
                        rowData: response.rows,
                        rowCount: response.lastRow,
                        pivotResultFields: response.pivotFields,
                    });
                } else {
                    params.fail();
                }
            }, 500);
        },
    };
}
