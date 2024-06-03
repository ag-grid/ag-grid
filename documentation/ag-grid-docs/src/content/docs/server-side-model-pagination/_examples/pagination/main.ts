import { GridApi, GridOptions, IServerSideDatasource, createGrid } from '@ag-grid-community/core';
import { CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';

import { FakeServer } from './fakeServer';

ModuleRegistry.registerModules([CommunityFeaturesModule, ColumnsToolPanelModule, MenuModule, ServerSideRowModelModule]);

let gridApi: GridApi<IOlympicDataWithId>;
const gridOptions: GridOptions<IOlympicDataWithId> = {
    columnDefs: [
        { field: 'id', maxWidth: 75 },
        { field: 'athlete', minWidth: 190 },
        { field: 'age' },
        { field: 'year' },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
    ],

    defaultColDef: {
        flex: 1,
        minWidth: 90,
    },

    // use the server-side row model
    rowModelType: 'serverSide',

    // enable pagination
    pagination: true,

    // 20 rows per page (default is 100)
    paginationPageSize: 20,

    // fetch 10 rows per block as page size is 10 (default is 100)
    cacheBlockSize: 10,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then(function (data) {
            // add id to data
            var idSequence = 1;
            data.forEach(function (item: any) {
                item.id = idSequence++;
            });

            // setup the fake server with entire dataset
            var fakeServer = new FakeServer(data);

            // create datasource with a reference to the fake server
            var datasource = getServerSideDatasource(fakeServer);

            // register the datasource with the grid
            gridApi!.setGridOption('serverSideDatasource', datasource);
        });
});

function getServerSideDatasource(server: any): IServerSideDatasource {
    return {
        getRows: (params) => {
            console.log('[Datasource] - rows requested by grid: ', params.request);

            var response = server.getData(params.request);

            // adding delay to simulate real server call
            setTimeout(() => {
                if (response.success) {
                    // call the success callback
                    params.success({ rowData: response.rows, rowCount: response.lastRow });
                } else {
                    // inform the grid request failed
                    params.fail();
                }
            }, 200);
        },
    };
}
