import { ClientSideRowModelModule } from 'ag-grid-community';
import { GridApi, GridOptions, createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { ColumnsToolPanelModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { getData } from './data';

ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnsToolPanelModule, MenuModule, RowGroupingModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'created' },
        { field: 'modified' },
        {
            field: 'size',
            aggFunc: 'sum',
            valueFormatter: (params) => {
                const sizeInKb = params.value / 1024;

                if (sizeInKb > 1024) {
                    return `${+(sizeInKb / 1024).toFixed(2)} MB`;
                } else {
                    return `${+sizeInKb.toFixed(2)} KB`;
                }
            },
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    autoGroupColumnDef: {
        headerName: 'File Explorer',
        minWidth: 280,
        cellRenderer: 'agGroupCellRenderer',
        cellRendererParams: {
            checkbox: true,
            suppressCount: true,
        },
    },
    rowData: getData(),
    treeData: true,
    getDataPath: (data) => data.path,
    selection: {
        mode: 'multiRow',
        checkboxes: false,
        headerCheckbox: false,
    },
    groupDefaultExpanded: -1,
    suppressAggFuncInHeader: true,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
