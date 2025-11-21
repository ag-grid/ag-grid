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
    TextEditorModule,
    TooltipModule,
    FormulaModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<any>;

const rowData = [
    { rid: '1', A: 1, B: 1, C: 1 },
    { rid: '2', A: 1, B: 1, C: 1 },
    {
        rid: '3',
        A: 1,
        B: 1,
        C: '="Result of \'=CUSTOMSUM(A1:B3, C1:C2)\' is "&CUSTOMSUM(REF(COLUMN("0"),ROW("1"),COLUMN("1"),ROW("3")),REF(COLUMN("2"),ROW("1"),COLUMN("2"),ROW("2")))',
    },
];

const gridOptions: GridOptions<any> = {
    columnDefs: [
        { field: 'A', colId: '0', width: 150 },
        { field: 'B', colId: '1', width: 150 },
        { field: 'C', colId: '2', flex: 1, allowFormula: true },
    ],
    getRowId: (params) => String(params.data.rid),
    cellSelection: {
        handle: {
            mode: 'fill',
        },
    },
    defaultColDef: {
        headerName: '',
        editable: true,
    },
    rowData,
    formulaFuncs: {
        CUSTOMSUM: {
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
