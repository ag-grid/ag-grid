import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    ModuleRegistry,
    NumberFilterModule,
    PivotModule,
    ServerSideRowModelApiModule,
    ServerSideRowModelModule,
    SetFilterModule,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    NumberFilterModule,
    ServerSideRowModelModule,
    ServerSideRowModelApiModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    SetFilterModule,
    PivotModule,
    TextFilterModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete', minWidth: 200 },
        { field: 'age' },
        { field: 'country', minWidth: 180 },
        { field: 'year' },
        { field: 'date', minWidth: 150 },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
    ],
    // theme: 'legacy',
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        // allow every column to be aggregated
        enableValue: true,
        sortable: false,
    },
    getRowId: (p) => p.data?.id,
    getRowHeight: (p) => {
        return 50 + 30 * Math.sin((p.data?.id ?? 0) / 5 - Math.PI / 2);
    },
    autoGroupColumnDef: {
        minWidth: 200,
    },
    onRowClicked: (p) => {
        p.node.setRowHeight(100);
        p.api.onRowHeightChanged();
    },
    // use the server-side row model
    rowModelType: 'serverSide',
};

const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;

function resetRowHeights() {
    gridApi.resetRowHeights();
}

// setup the grid after the page has finished loading
gridApi = createGrid(gridDiv, gridOptions);

function createServerSideDatasource(server) {
    return {
        getRows: (params) => {
            console.log('[Datasource] - rows requested by grid: ', params.request);

            // get data for request from our fake server
            const response = server.getData(params.request);

            // simulating real server call with a 500ms delay
            setTimeout(() => {
                if (response.success) {
                    // supply rows for requested block to grid
                    params.success({
                        rowData: response.rows,
                        rowCount: response.lastRow,
                    });
                } else {
                    params.fail();
                }
            }, 500);
        },
    };
}

function createFakeServer(allData) {
    return {
        getData: (request) => {
            // take a slice of the total rows for requested block
            const rowsForBlock = allData.slice(request.startRow, request.endRow);

            // here we are pretending we don't know the last row until we reach it!
            const lastRow = getLastRowIndex(request, rowsForBlock);

            return {
                success: true,
                rows: rowsForBlock,
                lastRow: lastRow,
            };
        },
    };
}

function getLastRowIndex(request, results) {
    if (!results) return undefined;
    const currentLastRow = (request.startRow || 0) + results.length;

    // if on or after the last block, work out the last row, otherwise return 'undefined'
    return currentLastRow < (request.endRow || 0) ? currentLastRow : undefined;
}

document.addEventListener('DOMContentLoaded', function () {
    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then(function (data) {
            // adding row id to data
            let idSequence = 0;
            data.forEach(function (item: { id: number }) {
                item.id = idSequence++;
            });

            // setup the fake server with entire dataset
            const fakeServer = createFakeServer(data);

            // create datasource with a reference to the fake server
            const datasource = createServerSideDatasource(fakeServer);

            // register the datasource with the grid
            gridApi.setGridOption('serverSideDatasource', datasource);
        });
});
