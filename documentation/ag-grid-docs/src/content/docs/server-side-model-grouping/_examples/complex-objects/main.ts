import { ColDef, GridApi, GridOptions, IServerSideDatasource, createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';

import { FakeServer } from './fakeServer';

ModuleRegistry.registerModules([RowGroupingModule, ServerSideRowModelModule]);

const columnDefs: ColDef[] = [
    // here we are using a valueGetter to get the country name from the complex object
    {
        colId: 'country',
        valueGetter: 'data.country.name',
        rowGroup: true,
        hide: true,
    },

    { field: 'gold', aggFunc: 'sum', enableValue: true },
    { field: 'silver', aggFunc: 'sum', enableValue: true },
    { field: 'bronze', aggFunc: 'sum', enableValue: true },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 150,
    },
    autoGroupColumnDef: {
        flex: 1,
        minWidth: 280,
    },
    // use the server-side row model
    rowModelType: 'serverSide',
};

function getServerSideDatasource(server: any): IServerSideDatasource {
    return {
        getRows: (params) => {
            console.log('[Datasource] - rows requested by grid: ', params.request);

            var response = server.getData(params.request);

            // convert country to a complex object
            var resultsWithComplexObjects = response.rows.map(function (row: any) {
                row.country = {
                    name: row.country,
                    code: row.country.substring(0, 3).toUpperCase(),
                };
                return row;
            });

            // adding delay to simulate real server call
            setTimeout(() => {
                if (response.success) {
                    // call the success callback
                    params.success({
                        rowData: resultsWithComplexObjects,
                        rowCount: response.lastRow,
                    });
                } else {
                    // inform the grid request failed
                    params.fail();
                }
            }, 200);
        },
    };
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then(function (data) {
            // setup the fake server with entire dataset
            var fakeServer = new FakeServer(data);

            // create datasource with a reference to the fake server
            var datasource = getServerSideDatasource(fakeServer);

            // register the datasource with the grid
            gridApi!.setGridOption('serverSideDatasource', datasource);
        });
});
