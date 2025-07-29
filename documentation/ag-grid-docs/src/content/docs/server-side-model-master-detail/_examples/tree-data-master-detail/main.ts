import type { GridApi, GridOptions, IDetailCellRendererParams } from 'ag-grid-community';
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

import { MyServerSideDatasource } from './myServerSideDataSource';

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
    rowModelType: 'serverSide',
    serverSideDatasource: new MyServerSideDatasource(),

    columnDefs: [{ field: 'info' }],
    defaultColDef: { flex: 1 },

    treeData: true,
    isServerSideGroup: (dataItem) => !!dataItem.children,
    getServerSideGroupKey: (dataItem) => dataItem.id,

    autoGroupColumnDef: {
        headerName: 'Name',
        field: 'name',
    },

    masterDetail: true,
    detailRowHeight: 220,
    detailCellRendererParams: {
        detailGridOptions: {
            columnDefs: [{ field: 'label' }, { field: 'value' }],
            defaultColDef: { flex: 1 },
        },
        getDetailRowData: (params) => {
            params.successCallback(params.data.details || []);
        },
    } as IDetailCellRendererParams<any, any>,
    isRowMaster: (data) => !!data.details?.length,

    onGridReady: (params) => {
        setTimeout(() => {
            params.api.getRowNode('1')?.setExpanded(true);
        }, 500);
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
