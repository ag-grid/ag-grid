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

const rowData = [
    { rid: '1', A: 1, B: 2 },
    { rid: '2', A: 2, B: 2 },
    {
        rid: '3',
        A: 1,
        B: 2,
        C: '="Result of \'=COUNTEQ(A1:B3,2)\' is "&COUNTEQ(REF(COLUMN("0"),ROW("1"),COLUMN("1"),ROW("3")),2)',
    },
];

const gridOptions: GridOptions<any> = {
    columnDefs: [
        { field: 'A', colId: '0', width: 150 },
        { field: 'B', colId: '1', width: 150 },
        { field: 'C', colId: '2', flex: 1 },
    ],
    getRowId: (params) => String(params.data.rid),
    cellSelection: {
        handle: {
            mode: 'fill',
        },
    },
    enableFormulas: true,
    defaultColDef: {
        headerName: '',
        editable: true,
    },
    rowData,
    formulaFuncs: {
        COUNTEQ: {
            func: (params) => {
                const argsArr = Array.from(params.args);
                if (argsArr.length != 2) {
                    throw 'COUNTEQ requires exactly 2 arguments';
                }
                const [range, criteria] = argsArr;
                if (range.kind !== 'range') {
                    throw 'First argument to COUNTEQ must be a range';
                }
                if (criteria.kind !== 'value' || typeof criteria.value === 'object') {
                    throw 'Second argument to COUNTEQ must be a primitive value';
                }
                const isNumCriteria = typeof criteria.value === 'number';
                let count = 0;
                for (const value of range) {
                    const coercedValue = isNumCriteria ? Number(value) : value;
                    if (coercedValue === criteria.value) {
                        count++;
                    }
                }
                return count;
            },
        },
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
