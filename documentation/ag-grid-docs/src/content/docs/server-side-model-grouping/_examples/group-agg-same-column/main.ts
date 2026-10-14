import type { GridApi, GridOptions, IServerSideDatasource } from 'ag-grid-community';
import { ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { ColumnsToolPanelModule, RowGroupingModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { FakeServer } from './fakeServer';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ColumnsToolPanelModule, RowGroupingModule, ServerSideRowModelModule]);

// group rows also hold the aggregate of the grouped column, e.g. `sum_gold`
interface OlympicGroupData extends IOlympicData {
    [aggField: string]: string | number;
}

let gridApi: GridApi<OlympicGroupData>;
const gridOptions: GridOptions<OlympicGroupData> = {
    columnDefs: [
        { field: 'country', enableRowGroup: true },
        { field: 'sport', enableRowGroup: true },
        { field: 'gold', rowGroup: true, aggFunc: 'sum', enableRowGroup: true, enableValue: true },
        { field: 'silver', aggFunc: 'sum', enableValue: true },
        { field: 'bronze', aggFunc: 'sum', enableValue: true },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 120,
    },
    autoGroupColumnDef: {
        flex: 1,
        minWidth: 240,
        field: 'athlete',
    },
    sideBar: 'columns',

    // the server returns the group key as `gold` and the aggregate as `<aggFunc>_gold`, e.g. `sum_gold`
    getServerSideGroupAggData: (params) => {
        const gold = params.api.getColumn('gold')!;
        const aggFunc = gold.getAggFunc();
        if (!gold.isValueActive() || typeof aggFunc !== 'string') {
            // Gold is not aggregated, so it reads the group key from the row data
            return undefined;
        }
        return { gold: params.data[`${aggFunc}_gold`] };
    },

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
            // setup the fake server with entire dataset
            const fakeServer = new FakeServer(data);

            // create datasource with a reference to the fake server
            const datasource = getServerSideDatasource(fakeServer);

            // register the datasource with the grid
            gridApi!.setGridOption('serverSideDatasource', datasource);
        });
});
