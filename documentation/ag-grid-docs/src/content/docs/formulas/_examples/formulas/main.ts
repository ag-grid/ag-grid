import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, FormulaModule, TextEditorModule, TooltipModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';
import { RowNumbersModule, CellSelectionModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    FormulaModule,
    TextEditorModule,
    TooltipModule,
    RowNumbersModule,
    CellSelectionModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<any>;

const rowData = [
    {
        rid: '1',
        A: 1,
        B: 2,
        C: 3,

        // Relative-only refs; good for vertical + horizontal fill tests
        D: '=A1+A2/A3',

        // Absolute column, relative row; col shouldn’t move on horizontal fill
        E: '=$A1',

        // Relative column, absolute row; row shouldn’t move on vertical fill
        F: '=A$1',

        // Fully absolute; never changes with fill
        G: '=$A$1',

        // Range with all-relative ends; shifts in either axis
        H: '=SUM(A1:B1)',

        // Mixed-absolute range ends; only the relative sides should shift
        I: '=SUM($A1:B$1)',
    },
    { rid: '2', A: 2, B: 4, C: 6 },
    { rid: '3', A: 3, B: 6, C: 9 },
    { rid: '4', A: 4, B: 8, C: 12 },
    { rid: '5', A: 5, B: 10, C: 15 },
    { rid: '6', A: 6, B: 12, C: 18 },
    { rid: '7', A: 7, B: 14, C: 21 },
    { rid: '8', A: 8, B: 16, C: 24 },
    { rid: '9', A: '=A1+A2', B: '=B1+B2', C: '=C1+C2' },
]

const gridOptions: GridOptions<any> = {
    columnDefs: [
        { field: 'A', colId: '0' },
        { field: 'B', colId: '1' },
        { field: 'C', colId: '2' },
        { field: 'D', colId: '3' },
        { field: 'E', colId: '4' },
        { field: 'F', colId: '5' },
        { field: 'G', colId: '6' },
        { field: 'H', colId: '7' },
        { field: 'I', colId: '8' },
    ],
    cellSelection: {
        handle: {
            mode: 'fill',
        },
    },
    getRowId: (params) => String(params.data.rid),
    enableFormulas: true,
    rowNumbers: true,
    defaultColDef: {
        headerName: '',
        tooltipValueGetter: () => { },
        editable: true,
        width: 150,
        cellDataType: 'text',
    },
    rowData,
};


// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
