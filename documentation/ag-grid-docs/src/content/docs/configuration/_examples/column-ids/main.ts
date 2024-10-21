import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridApi, GridOptions, GridReadyEvent, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        // colId will be 'height',
        { headerName: 'Col 1', field: 'height' },

        // colId will be 'firstWidth',
        { headerName: 'Col 2', colId: 'firstWidth', field: 'width' },
        // colId will be 'secondWidth'
        { headerName: 'Col 3', colId: 'secondWidth', field: 'width' },

        // no colId, no field, so grid generated ID
        { headerName: 'Col 4', valueGetter: 'data.width' },
        { headerName: 'Col 5', valueGetter: 'data.width' },
    ],
    rowData: createRowData(),
    onGridReady: (params: GridReadyEvent) => {
        var cols = params.api.getColumns()!;
        cols.forEach((col) => {
            var colDef = col.getColDef();
            console.log(colDef.headerName + ', Column ID = ' + col.getId(), JSON.stringify(colDef));
        });
    },
};

function createRowData() {
    var data = [];
    for (var i = 0; i < 20; i++) {
        data.push({
            height: Math.floor(Math.random() * 100),
            width: Math.floor(Math.random() * 100),
            depth: Math.floor(Math.random() * 100),
        });
    }
    return data;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
