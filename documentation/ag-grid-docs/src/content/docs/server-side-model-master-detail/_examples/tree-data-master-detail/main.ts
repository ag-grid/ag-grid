import type { GridApi, GridOptions, IDetailCellRendererParams, IServerSideDatasource } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    RowApiModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import {
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    MasterDetailModule,
    RowGroupingModule,
    ServerSideRowModelModule,
} from 'ag-grid-enterprise';

import { fakeData } from './data';
import { FakeServer } from './fakeServer';

ModuleRegistry.registerModules([
    RowApiModule,
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    MasterDetailModule,
    ColumnMenuModule,
    ContextMenuModule,
    RowGroupingModule,
    ServerSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi;
const gridOptions: GridOptions = {
    columnDefs: [{ field: 'info' }],
    defaultColDef: {
        flex: 1,
    },

    // use the server-side row model
    rowModelType: 'serverSide',

    // enable tree data
    treeData: true,
    isServerSideGroup: (dataItem) => !!dataItem.children,
    getServerSideGroupKey: (dataItem) => dataItem.id,

    // enable master detail
    masterDetail: true,
    isRowMaster: (data) => Array.isArray(data.details) && data.details.length > 0,
    autoGroupColumnDef: {
        headerName: 'Name',
        field: 'name',
    },
    detailCellRendererParams: {
        detailGridOptions: {
            columnDefs: [{ field: 'label' }, { field: 'value' }],
            defaultColDef: {
                flex: 1,
            },
        },
        getDetailRowData: (params) => {
            params.successCallback(params.data.details || []);
        },
    } as IDetailCellRendererParams<any, any>,
    detailRowHeight: 200,
    onGridReady: (params) => {
        setTimeout(() => {
            // Expand some nodes
            const nodeToExpand = params.api.getRowNode('2');
            if (nodeToExpand) {
                nodeToExpand.setExpanded(true);
            }
        }, 500);
    },
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
            }, 200);
        },
    };
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    const fakeServer = FakeServer(fakeData);
    const datasource = getServerSideDatasource(fakeServer);
    gridApi!.setGridOption('serverSideDatasource', datasource);
});
