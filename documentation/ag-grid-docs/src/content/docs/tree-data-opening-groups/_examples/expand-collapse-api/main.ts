import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

import { getData } from './data';

ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);

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
        filter: true,
    },
    autoGroupColumnDef: {
        headerName: 'File Explorer',
        minWidth: 150,
        filter: 'agTextColumnFilter',

        cellRendererParams: {
            suppressCount: true,
        },
    },
    rowData: getData(),
    treeData: true,
    getDataPath: (data) => data.path,
};

function expandAll() {
    gridApi!.expandAll();
}

function collapseAll() {
    gridApi!.collapseAll();
}

const expandTopLevel = () => {
    gridApi!.forEachNode((node) => {
        if (node.level === 0) {
            gridApi.setRowNodeExpanded(node, true);
        }
    });
};

// Expands all nodes that have key 'ProjectAlpha' and their parents
function expandProjectAlpha() {
    gridApi!.forEachNode((node) => {
        if (node.key === 'ProjectAlpha') {
            gridApi!.setRowNodeExpanded(node, true, true);
        }
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
