import type { GridApi, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import {
    CellStyleModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';

ModuleRegistry.registerModules([
    CellStyleModule,
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { headerName: 'Raw Value', field: 'a' },
        { headerName: 'Currency Amount (£)', field: 'a', valueFormatter: currencyFormatter },
        { headerName: 'Bracketed Value', field: 'a', valueFormatter: bracketsFormatter },
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
    const rowData = [];

    for (let i = 0; i < 100; i++) {
        rowData.push({
            a: Math.floor(((i + 2) * 173456) % 10000),
            b: Math.floor(((i + 7) * 373456) % 10000),
        });
    }

    return rowData;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
