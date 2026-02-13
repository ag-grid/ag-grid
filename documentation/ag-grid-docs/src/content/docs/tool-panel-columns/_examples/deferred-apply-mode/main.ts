import type { ColDef, GridApi, GridOptions, IServerSideDatasource, IServerSideGetRowsRequest } from 'ag-grid-community';
import { ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';
import {
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    PivotModule,
    ServerSideRowModelModule,
} from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ColumnsToolPanelModule,
    ColumnMenuModule,
    ContextMenuModule,
    PivotModule,
    ServerSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const columnDefs: ColDef[] = [
    { field: 'athlete', minWidth: 180, enableRowGroup: true, enablePivot: true },
    { field: 'age', enableRowGroup: true, enablePivot: true },
    { field: 'country', minWidth: 160, enableRowGroup: true, enablePivot: true },
    { field: 'year', enableRowGroup: true, enablePivot: true },
    { field: 'sport', minWidth: 180, enableRowGroup: true, enablePivot: true },
    { field: 'gold', enableValue: true },
    { field: 'silver', enableValue: true },
    { field: 'bronze', enableValue: true },
    { field: 'total', enableValue: true },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    rowModelType: 'serverSide',
    sideBar: {
        toolPanels: [
            {
                id: 'columns',
                labelDefault: 'Columns',
                labelKey: 'columns',
                iconKey: 'columns',
                toolPanel: 'agColumnsToolPanel',
                toolPanelParams: {
                    deferApply: true,
                    buttons: ['apply', 'cancel'],
                },
            },
        ],
        defaultToolPanel: 'columns',
    },
};

document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => {
            const fakeServer = createFakeServer(data);
            const datasource = createServerSideDatasource(fakeServer);
            gridApi!.setGridOption('serverSideDatasource', datasource);
        });
});

function createServerSideDatasource(server: { getData: (request: IServerSideGetRowsRequest) => any }): IServerSideDatasource {
    return {
        getRows: (params) => {
            const response = server.getData(params.request);

            setTimeout(() => {
                if (response.success) {
                    params.success({ rowData: response.rows });
                } else {
                    params.fail();
                }
            }, 200);
        },
    };
}

function createFakeServer(allData: IOlympicData[]) {
    return {
        getData: (request: IServerSideGetRowsRequest) => {
            const requestedRows = allData.slice(request.startRow, request.endRow);
            return {
                success: true,
                rows: requestedRows,
            };
        },
    };
}
