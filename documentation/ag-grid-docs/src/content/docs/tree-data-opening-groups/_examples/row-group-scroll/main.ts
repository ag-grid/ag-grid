import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, GridApi, GridOptions, RowGroupOpenedEvent, createGrid } from '@ag-grid-community/core';
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
        minWidth: 280,
        filter: 'agTextColumnFilter',

        cellRendererParams: {
            suppressCount: true,
        },
    },
    rowData: getData(),
    treeData: true,
    getDataPath: (data) => data.path,
    animateRows: false,
    onRowGroupOpened: onRowGroupOpened,
};

function onRowGroupOpened(event: RowGroupOpenedEvent<IOlympicData>) {
    if (event.expanded) {
        var rowNodeIndex = event.node.rowIndex!;
        // factor in child nodes so we can scroll to correct position
        var childCount = event.node.childrenAfterSort ? event.node.childrenAfterSort.length : 0;
        var newIndex = rowNodeIndex + childCount;
        gridApi!.ensureIndexVisible(newIndex);
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
