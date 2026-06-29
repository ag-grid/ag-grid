import type { GridApi, GridOptions, IServerSideDatasource } from 'ag-grid-community';
import { ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import {
    ColumnMenuModule,
    ColumnsToolPanelModule,
    RowGroupingPanelModule,
    ServerSideRowModelModule,
} from 'ag-grid-enterprise';

import { FakeServer } from './fakeServer';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ServerSideRowModelModule,
    RowGroupingPanelModule,
    ColumnsToolPanelModule,
    ColumnMenuModule,
]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'country', rowGroup: true },
        { field: 'sport' },
        { field: 'year', pivot: true },
        { field: 'age' },
        { field: 'gold', aggFunc: 'sum' },
        { field: 'silver' },
        { field: 'bronze' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 130,
        enableRowGroup: true,
        enablePivot: true,
        enableValue: true,
    },
    autoGroupColumnDef: {
        minWidth: 200,
    },

    // use the server-side row model
    rowModelType: 'serverSide',

    pivotMode: true,
    sideBar: {
        toolPanels: ['columns'],
        defaultToolPanel: '',
    },
    rowGroupPanelShow: 'always',
    pivotPanelShow: 'always',
};

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

function getServerSideDatasource(server: any): IServerSideDatasource {
    return {
        getRows: (params) => {
            const request = params.request;

            console.log('[Datasource] - rows requested by grid: ', params.request);

            const response = server.getData(request);

            // simulating real server call with a 500ms delay
            setTimeout(() => {
                if (response.success) {
                    // supply data to grid
                    params.success({
                        rowData: response.rows,
                        rowCount: response.lastRow,
                        pivotResultFields: response.pivotFields,
                    });
                } else {
                    params.fail();
                }
            }, 500);
        },
    };
}
