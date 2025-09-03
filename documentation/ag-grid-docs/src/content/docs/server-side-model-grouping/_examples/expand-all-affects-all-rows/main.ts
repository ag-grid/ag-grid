import type { GridApi, GridOptions, IServerSideDatasource } from 'ag-grid-community';
import { ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { FakeServer } from './fakeServer';

ModuleRegistry.registerModules([
    RowGroupingModule,
    ServerSideRowModelModule,
    ServerSideRowModelApiModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi;
const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'country', rowGroup: true },
        { field: 'id', aggFunc: 'sum', hide: true },
        { field: 'sport', rowGroup: true },
        { field: 'year', rowGroup: true },
        { field: 'gold', aggFunc: 'sum' },
        { field: 'silver', aggFunc: 'sum' },
        { field: 'bronze', aggFunc: 'sum' },
    ],
    getRowId: (p) => p.data.id, // required when ssrmExpandAllAffectsAllRows is true
    // use the server-side row model
    rowModelType: 'serverSide',
    purgeClosedRowNodes: true,
};

function getServerSideDatasource(server: any): IServerSideDatasource {
    return {
        getRows: (params) => {
            const response = server.getData(params.request);

            // adding delay to simulate real server call
            setTimeout(() => {
                if (response.success) {
                    // call the success callback
                    params.success({
                        rowData: response.rows,
                        rowCount: response.lastRow,
                    });
                } else {
                    // inform the grid request failed
                    params.fail();
                }
            }, 100);
        },
    };
}

function onExpandAll() {
    gridApi.expandAll();
}

function onCollapseAll() {
    gridApi.collapseAll();
}

function onOptionChange() {
    const ssrmExpandAllAffectsAllRows =
        document.querySelector<HTMLInputElement>('#ssrmExpandAllAffectsAllRows')!.checked;
    gridApi.setGridOption('ssrmExpandAllAffectsAllRows', ssrmExpandAllAffectsAllRows);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then(function (data) {
            const newData = data.map((e: IOlympicData, i: number) => ({
                ...e,
                id: i.toString(),
            }));
            // setup the fake server with entire dataset
            const fakeServer = FakeServer(newData);

            // create datasource with a reference to the fake server
            const datasource = getServerSideDatasource(fakeServer);

            // register the datasource with the grid
            gridApi!.setGridOption('serverSideDatasource', datasource);
        });
});
