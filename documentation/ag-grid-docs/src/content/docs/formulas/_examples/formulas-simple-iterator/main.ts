import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    FormulaModule,
    ModuleRegistry,
    TextEditorModule,
    TooltipModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { CellSelectionModule, RowNumbersModule } from 'ag-grid-enterprise';

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
    { rid: '1', A: 1, B: 1, C: 1 },
    { rid: '2', A: 1, B: 1, C: 'Total =CUSTOM(A1:B3, C1)' },
    { rid: '3', A: 1, B: 1, C: '=CUSTOM(A1:B3, C1)' },
];

const gridOptions: GridOptions<any> = {
    columnDefs: [
        { field: 'A', colId: '0' },
        { field: 'B', colId: '1' },
        { field: 'C', colId: '2', editable: false },
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
        CUSTOM: {
            func: (params) => {
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
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
