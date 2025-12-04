import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    TextEditorModule,
    TooltipModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { CellSelectionModule, FormulaModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    CellSelectionModule,
    ClientSideRowModelModule,
    FormulaModule,
    TextEditorModule,
    TooltipModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<any>;

const gridOptions: GridOptions<any> = {
    columnDefs: [
        { field: 'A', colId: '0', headerName: 'Gold' },
        { field: 'B', colId: '1', headerName: 'Silver' },
        { field: 'C', colId: '2', headerName: 'Bronze' },
        { field: 'D', colId: '3', headerName: 'Check Error Propagation' },
    ],
    getRowId: (params) => String(params.data.rid),
    cellSelection: {
        handle: {
            mode: 'fill',
        },
    },
    defaultColDef: {
        cellDataType: 'text',
        allowFormula: true,
        editable: true,
        flex: 1,
    },
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
    rowData: [
        { rid: 1, A: 1, B: 2, C: 3 },
        { rid: 2, A: 4, B: 5, C: 6 },
        { rid: 3, A: 2, B: 5, C: 2 },
        { rid: 4, A: 7, B: 8, C: 9 },
        { rid: 5, A: 0, B: 80, C: 10 },
        { rid: 6, A: 0, B: 4, C: 7 },
        { rid: 7, A: 7, B: 2, C: 2 },
        { rid: 8, A: 1, B: 0, C: 2 },
        {
            rid: 9,
            A: '=ERRORIFONE(REF(COLUMN("0"),ROW("1"),COLUMN("0"),ROW("3")))',
            B: '=ERRORIFONE(REF(COLUMN("1"),ROW("1"),COLUMN("1"),ROW("3")))',
            C: '=ERRORIFONE(REF(COLUMN("2"),ROW("1"),COLUMN("2"),ROW("3")))',
            D: '=CONCAT(REF(COLUMN("0"),ROW("9"),COLUMN("2"),ROW("9")))',
        },
    ],
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
