import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    TextEditorModule,
    TooltipModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { FormulaModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    FormulaModule,
    TextEditorModule,
    TooltipModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<any>;

const rowData = [
    { rid: '1', A: 1, B: 2, C: 3 },
    { rid: '2', A: 4, B: 5, C: 6 },
    { rid: '3', A: 7, B: 8, C: 9 },
    { rid: '4', A: '=ERRORIFONE(A1:A3)', B: '=ERRORIFONE(B1:B3)', C: '=ERRORIFONE(C1:C3)', D: '=CONCAT(A4:C4)' },
];

const gridOptions: GridOptions<any> = {
    columnDefs: [
        { field: 'A', colId: '0', headerName: 'Check A1:A3' },
        { field: 'B', colId: '1', headerName: 'Check B1:B3' },
        { field: 'C', colId: '2', headerName: 'Check C1:C3' },
        { field: 'D', colId: '3', headerName: 'Concat' },
    ],
    getRowId: (params) => String(params.data.rid),
    enableFormulas: true,
    defaultColDef: {
        headerName: '',
        editable: true,
        flex: 1,
    },
    rowData,
    formulaFuncs: {
        ERRORIFONE: {
            func: (params) => {
                for (const value of params.values) {
                    if (String(value) === '1') {
                        throw "Error, discovered a '1' in params";
                    }
                }
                return "SUCCESS, no '1' found.";
            },
        },
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
