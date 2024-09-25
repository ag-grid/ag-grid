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

    // adding a debounce to allow skipping over blocks while scrolling
    blockLoadDebounceMillis: 1000,
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
            }, 100);
        },
    };
}

function createFakeServer(allData: any[]) {
    return {
        getData: (request: IServerSideGetRowsRequest) => {
            // take a slice of the total rows for requested block
            var rowsForBlock = allData.slice(request.startRow, request.endRow);

            // when row count is known and 'blockLoadDebounceMillis' is set it is possible to
            // quickly skip over blocks while scrolling
            var lastRow = allData.length;

            return {
                success: true,
                rows: rowsForBlock,
                lastRow: lastRow,
            };
        },
    };
}
