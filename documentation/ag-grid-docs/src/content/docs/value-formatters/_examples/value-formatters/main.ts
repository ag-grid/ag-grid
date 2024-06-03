import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridApi, GridOptions, ValueFormatterParams, createGrid } from '@ag-grid-community/core';
import { CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';

ModuleRegistry.registerModules([CommunityFeaturesModule, ClientSideRowModelModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { headerName: 'A', field: 'a' },
        { headerName: 'B', field: 'b' },
        { headerName: '£A', field: 'a', valueFormatter: currencyFormatter },
        { headerName: '£B', field: 'b', valueFormatter: currencyFormatter },
        { headerName: '(A)', field: 'a', valueFormatter: bracketsFormatter },
        { headerName: '(B)', field: 'b', valueFormatter: bracketsFormatter },
    ],
    defaultColDef: {
        flex: 1,
        cellClass: 'number-cell',
    },
    rowData: createRowData(),
};

function bracketsFormatter(params: ValueFormatterParams) {
    return '(' + params.value + ')';
}

function currencyFormatter(params: ValueFormatterParams) {
    return '£' + formatNumber(params.value);
}

function formatNumber(number: number) {
    return Math.floor(number).toLocaleString();
}

function createRowData() {
    var rowData = [];

    for (var i = 0; i < 100; i++) {
        rowData.push({
            a: Math.floor(((i + 2) * 173456) % 10000),
            b: Math.floor(((i + 7) * 373456) % 10000),
        });
    }

    return rowData;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
