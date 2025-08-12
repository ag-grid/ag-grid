import {
    type GridApi,
    type GridOptions,
    type IServerSideDatasource,
    ModuleRegistry,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
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
    ssrmExpandAllAffectsAllRows: (document.querySelector('#input-display-type') as HTMLSelectElement).value === 'true',
    getRowId: (p) => p.data.id, // required when ssrmExpandAllAffectsAllRows is true
    // use the server-side row model
    rowModelType: 'serverSide',
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
    const key = document.querySelector<HTMLInputElement>('#input-display-type')?.checked;
    gridApi!.setGridOption('ssrmExpandAllAffectsAllRows', key);
}

const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
gridApi = createGrid(gridDiv, gridOptions);

fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then((response) => response.json())
    .then(function (data) {
        // setup the fake server with entire dataset
        const newData = data.map((e: IOlympicData, i: number) => ({
            ...e,
            id: `${e.country}-${e.sport}-${e.year}-${i}`,
        }));
        const fakeServer = new FakeServer(newData);

        // create datasource with a reference to the fake server
        const datasource = getServerSideDatasource(fakeServer);

        // register the datasource with the grid
        gridApi!.setGridOption('serverSideDatasource', datasource);
    });
