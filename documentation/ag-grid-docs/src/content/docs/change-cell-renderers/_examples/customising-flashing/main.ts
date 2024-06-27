import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

function formatNumber(number: number) {
    return Math.floor(number).toLocaleString();
}

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }, { field: 'd' }, { field: 'e' }, { field: 'f' }],
    defaultColDef: {
        flex: 1,
        cellClass: 'align-right',
        enableCellChangeFlash: true,
        valueFormatter: (params) => {
            return formatNumber(params.value);
        },
    },
    rowData: createRowData(),
};

function onUpdateSomeValues() {
    var rowCount = gridApi!.getDisplayedRowCount();
    // pick 20 cells at random to update
    for (var i = 0; i < 20; i++) {
        var row = Math.floor(Math.random() * rowCount);
        var rowNode = gridApi!.getDisplayedRowAtIndex(row)!;
        var col = ['a', 'b', 'c', 'd', 'e', 'f'][i % 6];
        rowNode.setDataValue(col, Math.floor(Math.random() * 10000));
    }
}

function createRowData() {
    var rowData = [];

    for (var i = 0; i < 20; i++) {
        rowData.push({
            a: Math.floor(((i + 323) * 25435) % 10000),
            b: Math.floor(((i + 323) * 23221) % 10000),
            c: Math.floor(((i + 323) * 468276) % 10000),
            d: 0,
            e: 0,
            f: 0,
        });
    }

    return rowData;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
