import { GridApi, GridOptions, IServerSideDatasource, IServerSideGetRowsRequest, createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { ColumnsToolPanelModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ColumnsToolPanelModule, MenuModule, ServerSideRowModelModule]);

let gridApi: GridApi<IOlympicDataWithId>;

const gridOptions: GridOptions<IOlympicDataWithId> = {
    columnDefs: [
        { field: 'id', maxWidth: 80 },
        { field: 'athlete', minWidth: 220 },
        { field: 'country', minWidth: 200 },
        { field: 'year' },
        { field: 'sport', minWidth: 200 },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
    ],

    defaultColDef: {
        flex: 1,
        minWidth: 100,
        sortable: false,
    },

    // use the server-side row model
    rowModelType: 'serverSide',

    // only keep 4 blocks of rows (default is keep all rows)
    maxBlocksInCache: 2,
    debug: true,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then(function (data) {
            // adding row id to data
            var idSequence = 0;
            data.forEach(function (item: any) {
                item.id = idSequence++;
            });

            // setup the fake server with entire dataset
            var fakeServer = createFakeServer(data);

            // create datasource with a reference to the fake server
            var datasource = createServerSideDatasource(fakeServer);

            // register the datasource with the grid
            gridApi!.setGridOption('serverSideDatasource', datasource);
        });
});

function createServerSideDatasource(server: any): IServerSideDatasource {
    return {
        getRows: (params) => {
            console.log('[Datasource] - rows requested by grid: ', params.request);

            // get data for request from our fake server
            var response = server.getData(params.request);

            // simulating real server call with a 500ms delay
            setTimeout(() => {
                if (response.success) {
                    // supply rows for requested block to grid
                    params.success({ rowData: response.rows, rowCount: response.lastRow });
                } else {
                    params.fail();
                }
            }, 500);
        },
    };
}

function createFakeServer(allData: any[]) {
    return {
        getData: (request: IServerSideGetRowsRequest) => {
            // take a slice of the total rows for requested block
            var rowsForBlock = allData.slice(request.startRow, request.endRow);

            // here we are pretending we don't know the last row until we reach it!
            var lastRow = getLastRowIndex(request, rowsForBlock);

            return {
                success: true,
                rows: rowsForBlock,
                lastRow: lastRow,
            };
        },
    };
}

function getLastRowIndex(request: IServerSideGetRowsRequest, results: any[]) {
    if (!results) return undefined;
    var currentLastRow = (request.startRow || 0) + results.length;

    // if on or after the last block, work out the last row, otherwise return 'undefined'
    return currentLastRow < (request.endRow || 0) ? currentLastRow : undefined;
}
