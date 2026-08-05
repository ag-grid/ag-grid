import type { GridApi, GridOptions, ValueGetterParams } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule]);

function hashValueGetter(params: ValueGetterParams) {
    return params.node ? Number(params.node.id) : null;
}

function abValueGetter(params: ValueGetterParams) {
    return params.data.a + params.data.b;
}

function a1000ValueGetter(params: ValueGetterParams) {
    return params.data.a * 1000;
}
function b137ValueGetter(params: ValueGetterParams) {
    return params.data.b * 137;
}
function chainValueGetter(params: ValueGetterParams) {
    return params.getValue('aPlusB') * 1000;
}
function constValueGetter() {
    return 99999;
}
let gridApi: GridApi;
const gridOptions: GridOptions = {
    columnDefs: [
        {
            headerName: 'ID #',
            maxWidth: 100,
            valueGetter: hashValueGetter,
        },
        { field: 'a' },
        { field: 'b' },
        {
            headerName: 'A + B',
            colId: 'aPlusB',
            valueGetter: abValueGetter,
        },
        {
            headerName: 'A * 1000',
            minWidth: 95,
            valueGetter: a1000ValueGetter,
        },
        {
            headerName: 'B * 137',
            minWidth: 90,
            valueGetter: b137ValueGetter,
        },
        {
            headerName: 'Chain',
            valueGetter: chainValueGetter,
        },
        {
            headerName: 'Const',
            minWidth: 85,
            valueGetter: constValueGetter,
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 75,
        // cellClass: 'number-cell'
    },
    rowData: createRowData(),
};

function createRowData() {
    const rowData = [];
    for (let i = 0; i < 100; i++) {
        rowData.push({
            a: Math.floor(i % 4),
            b: Math.floor(i % 7),
        });
    }
    return rowData;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
