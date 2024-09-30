import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridApi, GridOptions, GroupSelectionMode, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

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
            suppressCount: true,
        },
    },
    rowSelection: {
        mode: 'multiRow',
        groupSelects: 'self',
    },
    groupDefaultExpanded: -1,
    suppressAggFuncInHeader: true,
    rowData: getData(),
    treeData: true,
    getDataPath: (data) => data.path,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});

function getGroupSelectsValue(): GroupSelectionMode {
    return (document.querySelector<HTMLSelectElement>('#input-group-selection-mode')?.value as any) ?? 'self';
}

function onSelectionModeChange() {
    gridApi.setGridOption('rowSelection', {
        mode: 'multiRow',
        groupSelects: getGroupSelectsValue(),
    });
}

function onQuickFilterChanged() {
    gridApi.setGridOption('quickFilterText', document.querySelector<HTMLInputElement>('#input-quick-filter')?.value);
}
