import type { GridApi, GridOptions, IAggFuncParams, IAggFuncResult, ValueGetterParams } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import {
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    RowGroupingModule,
    SetFilterModule,
} from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    ColumnMenuModule,
    ContextMenuModule,
    RowGroupingModule,
    SetFilterModule,
]);

/** Carries `gold`/`silver` running totals; the ratio is derived so the wrapper can't go inconsistent. */
class RatioResult implements IAggFuncResult<number | null> {
    readonly value: number | null;

    constructor(
        readonly gold: number,
        readonly silver: number
    ) {
        this.value = silver ? gold / silver : null;
    }

    toNumber(): number | null {
        return this.value;
    }

    toString() {
        const value = this.value;
        return value === null ? '' : value.toFixed(2);
    }
}

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'year', rowGroup: true, hide: true },
        { field: 'total', aggFunc: 'sum' },
        {
            headerName: 'Gold to Silver',
            colId: 'goldSilverRatio',
            aggFunc: 'ratio',
            valueGetter: leafRatioValueGetter,
        },
    ],
    aggFuncs: {
        ratio: ratioAggFunc,
    },
    defaultColDef: {
        flex: 1,
        minWidth: 150,
    },
    autoGroupColumnDef: {
        field: 'athlete',
        minWidth: 220,
    },
};

// Leaf rows always expose a `RatioResult` so the aggFunc reads every child uniformly.
// Rows with no silvers carry `silver: 0` — `toString` blanks the cell, while `gold`/`silver`
// stay available for the parent group's running totals.
function leafRatioValueGetter(params: ValueGetterParams<IOlympicData>): RatioResult | undefined {
    if (!params.data) {
        return undefined;
    }
    const { gold, silver } = params.data;
    return new RatioResult(gold, silver);
}

function ratioAggFunc(params: IAggFuncParams<IOlympicData>): RatioResult {
    let gold = 0;
    let silver = 0;
    for (const child of params.aggregatedChildren) {
        // Every child — leaf or sub-group — exposes a `RatioResult` here. `'data'` mode returns
        // it as-is; `'value'` would unwrap via `toNumber()` and lose the `gold`/`silver` totals.
        const ratio = child.getDataValue(params.column, 'data');
        if (ratio instanceof RatioResult) {
            gold += ratio.gold;
            silver += ratio.silver;
        }
    }
    return new RatioResult(gold, silver);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
