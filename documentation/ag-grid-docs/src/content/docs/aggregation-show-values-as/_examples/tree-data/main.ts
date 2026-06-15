import type { GridApi, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import {
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    ShowValueAsModule,
    TreeDataModule,
} from 'ag-grid-enterprise';

import type { FileRow } from './data';
import { getData } from './data';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    TextFilterModule,
    ColumnMenuModule,
    ContextMenuModule,
    ColumnsToolPanelModule,
    TreeDataModule,
    ShowValueAsModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const formatSize = (params: ValueFormatterParams) => {
    const kb = (params.value ?? 0) / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
};

let gridApi: GridApi<FileRow>;

const gridOptions: GridOptions<FileRow> = {
    columnDefs: [
        // Tree data populates aggregates on parent folders, so each node's size is shown
        // as a share of the folder that contains it.
        { field: 'size', aggFunc: 'sum', valueFormatter: formatSize, showValueAs: 'percentOfParentTotal' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 130,
        enableValue: true,
        filter: true,
    },
    autoGroupColumnDef: {
        headerName: 'Folder',
        minWidth: 280,
        filter: 'agTextColumnFilter',
    },
    treeData: true,
    groupDefaultExpanded: 1,
    getDataPath: (data) => data.path,
    rowData: getData(),
    sideBar: 'columns',
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
