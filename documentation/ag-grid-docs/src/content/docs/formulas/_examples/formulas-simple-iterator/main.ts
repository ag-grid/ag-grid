import type { GridApi, GridOptions } from 'ag-grid-community';
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

let gridApi: GridApi<any>;

const rowData = [
    { rid: '1', gold: 1, silver: 1, totals: '="Result of \'=CUSTOMSUM(A1:B1)\' is "&CUSTOMSUM(A1:B1)' },
    { rid: '2', gold: 1, silver: 2, totals: '="Result of \'=CUSTOMSUM(A2:B2)\' is "&CUSTOMSUM(A2:B2)' },
    {
        rid: '3',
        gold: 1,
        silver: 1,
        totals: '="Result of \'=CUSTOMSUM(A1:B3, B1)\' is "&CUSTOMSUM(A1:B3, B1)',
    },
];

const gridOptions: GridOptions<any> = {
    columnDefs: [
        { field: 'gold', colId: '0', width: 150 },
        { field: 'silver', colId: '1', width: 150 },
        { field: 'totals', colId: '2', flex: 1, cellDataType: 'text', allowFormula: true },
    ],
    getRowId: (params) => String(params.data.rid),
    cellSelection: {
        handle: {
            mode: 'fill',
        },
    },
    defaultColDef: {
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
