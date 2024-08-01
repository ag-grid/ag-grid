import {
    type GridApi,
    type GridOptions,
    type IServerSideDatasource,
    type IServerSideGetRowsRequest,
    createGrid,
} from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';

ModuleRegistry.registerModules([ColumnsToolPanelModule, MenuModule, RowGroupingModule, ServerSideRowModelModule]);

interface FakeServer {
    getData: (request: IServerSideGetRowsRequest) => any;
    addChildRow: (route: string[], newRow: any) => void;
    toggleEmployment: (route: string[]) => void;
    removeEmployee: (route: string[]) => void;
    moveEmployee: (from: string[], to: string[]) => void;
}

let fakeServer: FakeServer;

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
    columnDefs: [
        { field: 'employeeId', hide: true },
        { field: 'employeeName', hide: true },
        { field: 'employmentType' },
        { field: 'startDate' },
    ],
    cacheBlockSize: 10,
    selectionOptions: {
        mode: 'multiRow',
        groupSelects: 'descendants',
        headerCheckbox: true,
        checkboxSelection: true,
    },
    isServerSideGroupOpenByDefault: (params) => {
        var isKathrynPowers = params.rowNode.level == 0 && params.data.employeeName == 'Kathryn Powers';
        var isMabelWard = params.rowNode.level == 1 && params.data.employeeName == 'Mabel Ward';
        return isKathrynPowers || isMabelWard;
    },
    getRowId: (row) => String(row.data.employeeId),
    isServerSideGroup: (dataItem) => dataItem.group,
    getServerSideGroupKey: (dataItem) => dataItem.employeeName,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/tree-data.json')
        .then((response) => response.json())
        .then(function (data) {
            const adjustedData = [
                {
                    employeeId: -1,
                    employeeName: 'Robert Peterson',
                    employmentType: 'Founder',
                    startDate: '24/01/1990',
                },
                ...data,
            ];
            var fakeServer = createFakeServer(adjustedData, gridApi!);
            var datasource = createServerSideDatasource(fakeServer);
            gridApi!.setGridOption('serverSideDatasource', datasource);
        });
});

function createFakeServer(fakeServerData: any[], api: GridApi) {
    const getDataAtRoute = (route: string[]) => {
        let mutableRoute = [...route];
        let target: any = { underlings: fakeServerData };
        while (mutableRoute.length) {
            const nextRoute = mutableRoute[0];
            mutableRoute = mutableRoute.slice(1);
            target = target.underlings.find((e: any) => e.employeeName === nextRoute);
        }
        return target;
    };

    const sanitizeRowForGrid = (d: any) => {
        return {
            group: !!d.underlings && !!d.underlings.length,
            employeeId: d.employeeId,
            employeeName: d.employeeName,
            employmentType: d.employmentType,
            startDate: d.startDate,
        };
    };

    fakeServer = {
        getData: (request: IServerSideGetRowsRequest): any => {
            function extractRowsFromData(groupKeys: string[], data: any[]): any {
                if (groupKeys.length === 0) {
                    return data.map(sanitizeRowForGrid);
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
        addChildRow: (route: string[], newRow: any) => {
            const target = getDataAtRoute(route);
            if (!target.underlings || target.underlings.length === 0) {
                target.underlings = [newRow];

                // update the parent row via transaction
                api.applyServerSideTransaction({
                    route: route.slice(0, route.length - 1),
                    update: [sanitizeRowForGrid(target)],
                });
            } else {
                target.underlings.push(newRow);

                // add the child row via transaction
                api.applyServerSideTransaction({
                    route,
                    add: [sanitizeRowForGrid(newRow)],
                });
            }
        },
        toggleEmployment: (route: string[]) => {
            const target = getDataAtRoute(route);
            // update the data at the source
            target.employmentType = target.employmentType === 'Contract' ? 'Permanent' : 'Contract';

            // inform the grid of the changes
            api.applyServerSideTransaction({
                route: route.slice(0, route.length - 1),
                update: [sanitizeRowForGrid(target)],
            });
        },
        removeEmployee: (route: string[]) => {
            const target = getDataAtRoute(route);

            const parent = getDataAtRoute(route.slice(0, route.length - 1));
            parent.underlings = parent.underlings.filter((child: any) => child.employeeName !== target.employeeName);
            if (parent.underlings.length === 0) {
                // update the parent row via transaction, as it's no longer a group
                api.applyServerSideTransaction({
                    route: route.slice(0, route.length - 2),
                    update: [sanitizeRowForGrid(parent)],
                });
            } else {
                // inform the grid of the changes
                api.applyServerSideTransaction({
                    route: route.slice(0, route.length - 1),
                    remove: [sanitizeRowForGrid(target)],
                });
            }
        },
        moveEmployee: (route: string[], to: string[]) => {
            const target = getDataAtRoute(route);

            // remove employee from old group
            fakeServer.removeEmployee(route);

            // add employee to new group
            fakeServer.addChildRow(to, target);
        },
    };
    return fakeServer;
}

function createServerSideDatasource(fakeServer: FakeServer) {
    const dataSource: IServerSideDatasource = {
        getRows: (params) => {
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
