import type { FormulaFunctionParams, GetRowIdParams, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberEditorModule,
    TextEditorModule,
    TooltipModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { CellSelectionModule, FormulaModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    CellSelectionModule,
    ClientSideRowModelModule,
    NumberEditorModule,
    TextEditorModule,
    TooltipModule,
    FormulaModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'gold', colId: 'c0' },
        { field: 'silver', colId: 'c1' },
        { field: 'totals', colId: 'c2', cellDataType: 'text', allowFormula: true },
    ],
    getRowId: (params: GetRowIdParams) => String(params.data.rid),
    cellSelection: {
        handle: {
            mode: 'fill',
        },
    },
    defaultColDef: {
        flex: 1,
        editable: true,
    },
    formulaFuncs: {
        CUSTOMSUM: {
            func: (params: FormulaFunctionParams) => {
                let total = 0;
                for (const value of params.values) {
                    const num = Number(value);
                    if (Number.isFinite(num)) {
                        total += num;
                    }
                }
                return total;
            },
        },
    },
    rowData: [
        { rid: '1', gold: 1, silver: 1, totals: '=CUSTOMSUM(A1:B1)' },
        { rid: '2', gold: 1, silver: 2, totals: '=CUSTOMSUM(A2:B2)' },
        { rid: '3', gold: 4, silver: 0, totals: '=CUSTOMSUM(A3:B3)' },
        { rid: '4', gold: 0, silver: 0, totals: '=CUSTOMSUM(A4:B4)' },
        { rid: '5', gold: 2, silver: 13, totals: '=CUSTOMSUM(A5:B5)' },
        { rid: '6', gold: 0, silver: 1, totals: '=CUSTOMSUM(A6:B6)' },
        { rid: '7', gold: 9, silver: 6, totals: '=CUSTOMSUM(A7:B7)' },
        { rid: '8', gold: 0, silver: 11, totals: '=CUSTOMSUM(A1:B8, B1)' },
    ],
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
