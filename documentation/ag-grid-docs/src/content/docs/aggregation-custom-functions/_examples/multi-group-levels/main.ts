import type { GridApi, GridOptions, IAggFuncParams, IAggFuncResult } from 'ag-grid-community';
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

/** Carries `min`/`max` alongside the scalar `value` so the parent recomputes in `O(N)`. */
class RangeResult implements IAggFuncResult<number> {
    constructor(
        readonly value: number,
        readonly min: number,
        readonly max: number
    ) {}

    toNumber() {
        return this.value;
    }

    toString() {
        return this.value.toFixed(2);
    }
}

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'year', rowGroup: true, hide: true },
        { headerName: 'Range', field: 'total', aggFunc: 'range' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
    },
    autoGroupColumnDef: {
        field: 'athlete',
        minWidth: 220,
    },
    aggFuncs: {
        range: rangeAggFunc,
    },
};

function rangeAggFunc(params: IAggFuncParams<IOlympicData>): RangeResult | null {
    // Read each immediate child via `getDataValue(col, 'data')`:
    //  - leaf children return the raw `total` number
    //  - sub-group children return the RangeResult this function produced one
    //    level down — its `min`/`max` let the parent recompute the range
    //    without re-walking descendant leaves.
    let min = Infinity;
    let max = -Infinity;
    for (const child of params.aggregatedChildren) {
        const childValue = child.getDataValue(params.column, 'data');
        if (typeof childValue === 'number') {
            min = Math.min(min, childValue);
            max = Math.max(max, childValue);
        } else if (childValue instanceof RangeResult) {
            min = Math.min(min, childValue.min);
            max = Math.max(max, childValue.max);
        }
    }
    return Number.isFinite(min) ? new RangeResult(max - min, min, max) : null;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
