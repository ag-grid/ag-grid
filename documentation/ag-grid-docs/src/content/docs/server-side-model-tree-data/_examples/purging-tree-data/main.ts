import {
    ColDef,
    GridApi,
    GridOptions,
    IServerSideDatasource,
    IServerSideGetRowsParams,
    IServerSideGetRowsRequest,
    IsServerSideGroup,
    IsServerSideGroupOpenByDefaultParams,
    createGrid,
} from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { ColumnsToolPanelModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';
import { RowGroupingModule } from 'ag-grid-enterprise';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ColumnsToolPanelModule, MenuModule, RowGroupingModule, ServerSideRowModelModule]);

const columnDefs: ColDef[] = [
    { field: 'employeeId', hide: true },
    { field: 'employeeName', hide: true },
    { field: 'employmentType' },
    { field: 'startDate' },
];

let gridApi: GridApi;

const gridOptions: GridOptions = {
    defaultColDef: {
        width: 235,
        flex: 1,
        sortable: false,
    },
    autoGroupColumnDef: {
        field: 'employeeName',
    },
    rowModelType: 'serverSide',
    treeData: true,
    columnDefs: columnDefs,
    cacheBlockSize: 10,
    isServerSideGroupOpenByDefault: (params: IsServerSideGroupOpenByDefaultParams) => {
        var isKathrynPowers = params.rowNode.level == 0 && params.data.employeeName == 'Kathryn Powers';
        var isMabelWard = params.rowNode.level == 1 && params.data.employeeName == 'Mabel Ward';
        return isKathrynPowers || isMabelWard;
    },
    isServerSideGroup: (dataItem: any) => {
        // indicate if node is a group
        return dataItem.group;
    },
    getServerSideGroupKey: (dataItem: any) => {
        // specify which group key to use
        return dataItem.employeeName;
    },
};

function refreshCache(route: string[]) {
    gridApi!.refreshServerSide({ route: route, purge: true });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/tree-data.json')
        .then((response) => response.json())
        .then(function (data) {
            var fakeServer = createFakeServer(data);
            var datasource = createServerSideDatasource(fakeServer);
            gridApi!.setGridOption('serverSideDatasource', datasource);
        });
});

function createFakeServer(fakeServerData: any[]) {
    const fakeServer = {
        getData: (request: IServerSideGetRowsRequest) => {
            function extractRowsFromData(groupKeys: string[], data: any[]): any {
                if (groupKeys.length === 0) {
                    return data.map(function (d) {
                        return {
                            group: !!d.underlings,
                            employeeId: d.employeeId + '',
                            employeeName: d.employeeName,
                            employmentType: d.employmentType,
                            startDate: d.startDate,
                        };
                    });
                }

                var key = groupKeys[0];
                for (var i = 0; i < data.length; i++) {
                    if (data[i].employeeName === key) {
                        return extractRowsFromData(groupKeys.slice(1), data[i].underlings.slice());
                    }
                }
            }

            return extractRowsFromData(request.groupKeys, fakeServerData);
        },
    };
    return fakeServer;
}

function createServerSideDatasource(fakeServer: any) {
    const dataSource: IServerSideDatasource = {
        getRows: (params: IServerSideGetRowsParams) => {
            console.log('ServerSideDatasource.getRows: params = ', params);
            var request = params.request;
            var allRows = fakeServer.getData(request);
            var doingInfinite = request.startRow != null && request.endRow != null;
            var result = doingInfinite
                ? {
                      rowData: allRows.slice(request.startRow, request.endRow),
                      rowCount: allRows.length,
                  }
                : { rowData: allRows };
            console.log('getRows: result = ', result);
            setTimeout(() => {
                params.success(result);
            }, 500);
        },
    };

    return dataSource;
}
