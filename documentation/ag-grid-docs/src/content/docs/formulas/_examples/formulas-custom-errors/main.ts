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
        D: '=ADD(A1, "string to concatenate")',
    },
    { rid: '2', A: 2, B: 4, C: 6, D: '=ADD()' },
    { rid: '3', A: 3, B: 6, C: 9 },
    { rid: '4', A: 4, B: 8, C: 12 },
    { rid: '5', A: 5, B: 10, C: 15 },
    { rid: '6', A: 6, B: 12, C: 18 },
    { rid: '7', A: 7, B: 14, C: 21 },
    { rid: '8', A: 8, B: 16, C: 24 },
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
    formulaFuncs: {
        ADD: {
            func: (iterator: Iterable<unknown>) => {
                let total = 0;
                let count = 0;
                for (const value of iterator) {
                    if (typeof value !== 'number') {
                        throw 'ADD only supports numbers';
                    }
                    count++;
                    total += value;
                }
                if (count === 0) {
                    throw 'ADD requires at least one argument';
                }
                return total;
            },
        },
    },
};


// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
