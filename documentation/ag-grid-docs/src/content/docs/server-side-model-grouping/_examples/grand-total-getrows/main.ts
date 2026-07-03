import type { GridApi, GridOptions, IServerSideDatasource } from 'ag-grid-community';
import {
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import {
    ColumnMenuModule,
    ColumnsToolPanelModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    ServerSideRowModelModule,
} from 'ag-grid-enterprise';

import { FakeServer } from './fakeServer';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ColumnMenuModule,
    ColumnsToolPanelModule,
    NumberFilterModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    ServerSideRowModelModule,
    TextFilterModule,
]);

let gridApi: GridApi<IOlympicData>;
const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'sport', rowGroup: true, hide: true },
        { field: 'year', minWidth: 100, filter: 'agNumberColumnFilter', floatingFilter: true },
        { field: 'gold', aggFunc: 'sum', enableValue: true, filter: 'agNumberColumnFilter', floatingFilter: true },
        { field: 'silver', aggFunc: 'sum', enableValue: true, filter: 'agNumberColumnFilter', floatingFilter: true },
        { field: 'bronze', aggFunc: 'sum', enableValue: true, filter: 'agNumberColumnFilter', floatingFilter: true },
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
    rowModelType: 'serverSide',
    grandTotalRow: 'bottom',
    cacheBlockSize: 20,
    sideBar: {
        toolPanels: ['columns'],
    },
};

function getServerSideDatasource(server: ReturnType<typeof FakeServer>): IServerSideDatasource {
    return {
        getRows: (params) => {
            console.log('[Datasource] - rows requested by grid: ', params.request);

            const response = server.getData(params.request, params.needsGrandTotal);

            // Delay long enough for the loading rows to be clearly visible, simulating a remote call.
            setTimeout(() => {
                if (response.success) {
                    params.success({
                        rowData: response.rows,
                        rowCount: response.lastRow,
                        grandTotalData: response.grandTotalData,
                    });
                } else {
                    params.fail();
                }
            }, 800);
        },
    };
}

document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then(function (data) {
            const fakeServer = new FakeServer(data);
            const datasource = getServerSideDatasource(fakeServer);
            gridApi!.setGridOption('serverSideDatasource', datasource);
        });
});
