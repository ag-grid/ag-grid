import type {
    GetRowIdParams,
    GridApi,
    GridOptions,
    IServerSideDatasource,
    IServerSideGetRowsParams,
    IsServerSideGroupOpenByDefaultParams,
} from 'ag-grid-community';
import { GetServerSideGroupLevelParamsParams, ServerSideGroupLevelParams, createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';

import { FakeServer } from './fakeServer';

ModuleRegistry.registerModules([RowGroupingModule, ServerSideRowModelModule]);

let gridApi: GridApi<IOlympicData>;
const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'country', enableRowGroup: true, rowGroup: true, hide: true },
        { field: 'sport', enableRowGroup: true, rowGroup: true, hide: true },
        { field: 'year', minWidth: 100 },
        { field: 'gold', aggFunc: 'sum', enableValue: true },
        { field: 'silver', aggFunc: 'sum', enableValue: true },
        { field: 'bronze', aggFunc: 'sum', enableValue: true },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 120,
    },
    autoGroupColumnDef: {
        flex: 1,
        minWidth: 280,
    },
    rowModelType: 'serverSide',
    selection: { mode: 'multiRow', checkboxes: false, headerCheckbox: false },
    isServerSideGroupOpenByDefault,
    getRowId,
};

function getRowId(params: GetRowIdParams) {
    return Math.random().toString();
}

function isServerSideGroupOpenByDefault(params: IsServerSideGroupOpenByDefaultParams) {
    const route = params.rowNode.getRoute();
    if (!route) {
        return false;
    }

    const routeAsString = route.join(',');

    const routesToOpenByDefault = ['Zimbabwe', 'Zimbabwe,Swimming', 'United States,Swimming'];

    return routesToOpenByDefault.indexOf(routeAsString) >= 0;
}

function onBtRouteOfSelected() {
    const selectedNodes = gridApi!.getSelectedNodes();
    selectedNodes.forEach(function (rowNode, index) {
        const route = rowNode.getRoute();
        const routeString = route ? route.join(',') : undefined;
        console.log('#' + index + ', route = [' + routeString + ']');
    });
}

function getServerSideDatasource(server: any): IServerSideDatasource {
    return {
        getRows: (params: IServerSideGetRowsParams) => {
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
            }, 400);
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
            // setup the fake server with entire dataset
            const fakeServer = new FakeServer(data);

            // create datasource with a reference to the fake server
            const datasource = getServerSideDatasource(fakeServer);

            // register the datasource with the grid
            gridApi!.setGridOption('serverSideDatasource', datasource);
        });
});
