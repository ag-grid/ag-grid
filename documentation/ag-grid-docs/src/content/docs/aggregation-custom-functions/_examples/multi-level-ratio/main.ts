import type { GridApi, GridOptions, IAggFuncParams, IAggFuncResult, ValueGetterParams } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';
import {
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    RowGroupingModule,
    SetFilterModule,
} from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    ColumnMenuModule,
    ContextMenuModule,
    RowGroupingModule,
    SetFilterModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

/** Carries `gold`/`silver` totals alongside the scalar ratio so the parent recomputes in `O(N)`. */
class RatioResult implements IAggFuncResult<number> {
    constructor(
        readonly value: number,
        readonly gold: number,
        readonly silver: number
    ) {}

    toNumber() {
        return this.value;
    }

    toString() {
        return Number.isFinite(this.value) ? this.value.toFixed(2) : '';
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
// Rows with no silvers produce a non-finite ratio value — `toString` blanks the cell out,
// while `gold`/`silver` are still preserved for the parent group's running totals.
// Footer/filler rows have no `data`; return undefined so the cell is left empty.
function leafRatioValueGetter(params: ValueGetterParams<IOlympicData>): RatioResult | undefined {
    if (!params.data) {
        return undefined;
    }
    const { gold, silver } = params.data;
    return new RatioResult(gold / silver, gold, silver);
}

function ratioAggFunc(params: IAggFuncParams<IOlympicData>): RatioResult | null {
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
    return silver ? new RatioResult(gold / silver, gold, silver) : null;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
