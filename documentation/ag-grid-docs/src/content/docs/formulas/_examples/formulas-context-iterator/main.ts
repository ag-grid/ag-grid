import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    CellApiModule,
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
    FormulaModule,
    CellApiModule,
    NumberEditorModule,
    TextEditorModule,
    TooltipModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<any>;

const rowData = [
    { rid: 'r1', gold: 1, silver: 2 },
    { rid: 'r2', gold: 2, silver: 2 },
    {
        rid: 'r3',
        gold: 1,
        silver: 2,
        result: '=COUNTEQ(REF(COLUMN("c0"),ROW("r1"),COLUMN("c1"),ROW("r3")),2)',
    },
];

const gridOptions: GridOptions<any> = {
    columnDefs: [
        { field: 'gold', colId: 'c0', width: 100 },
        { field: 'silver', colId: 'c1', width: 100 },
        { field: 'result', colId: 'c2', width: 100, allowFormula: true },
        {
            field: 'formula',
            colId: '3',
            flex: 1,
            editable: false,
            allowFormula: false,
            valueGetter: (params) => params.getValue('c2'),
        },
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
