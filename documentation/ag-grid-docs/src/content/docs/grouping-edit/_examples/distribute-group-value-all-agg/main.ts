import type { GridApi, GridOptions, GroupRowValueSetterFunc, IAggFunc, IAggFuncParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberEditorModule,
    NumberFilterModule,
    TextEditorModule,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { RowGroupingEditModule, RowGroupingModule } from 'ag-grid-enterprise';

import type { MetricsRecord } from './data';
import { getData } from './data';

ModuleRegistry.registerModules([
    RowGroupingModule,
    RowGroupingEditModule,
    ClientSideRowModelModule,
    NumberEditorModule,
    TextEditorModule,
    NumberFilterModule,
    TextFilterModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<MetricsRecord>;

/** Custom aggregation function: sum of squares. */
const sumOfSquares: IAggFunc = (params: IAggFuncParams) => {
    let total = 0;
    for (const value of params.values) {
        const n = Number(value);
        if (Number.isFinite(n)) {
            total += n * n;
        }
    }
    return total;
};

/**
 * Custom groupRowValueSetter for sumOfSquares.
 *
 * Because sumOfSquares uses x² in its aggregation, the built-in strategies
 * (uniform, percentage, etc.) would not produce correct results.
 * Instead, we compute the square root to find the per-child value that
 * produces the desired aggregate: each child = √(newValue / count).
 */
const sumOfSquaresValueSetter: GroupRowValueSetterFunc<MetricsRecord> = ({ newValue, aggregatedChildren, column }) => {
    const target = Number(newValue);
    const count = aggregatedChildren.length;
    if (!count || !Number.isFinite(target)) {
        return false;
    }
    const perChild = Math.round(Math.sqrt(Math.max(0, target / count)));
    let changed = false;
    for (const child of aggregatedChildren) {
        if (child.setDataValue(column, perChild, 'data')) {
            changed = true;
        }
    }
    return changed;
};

const gridOptions: GridOptions<MetricsRecord> = {
    columnDefs: [
        { field: 'department', rowGroup: true, hide: true },
        { field: 'team', rowGroup: true, hide: true },
        { field: 'employee', minWidth: 120 },

        // sum: uniform distribution (divides equally), with integer rounding
        {
            field: 'salary',
            aggFunc: 'sum',
            groupRowValueSetter: { precision: 0 },
        },

        // avg: overwrites every child with the edited value
        { field: 'bonus', aggFunc: 'avg' },

        // Custom aggregation function with a custom groupRowValueSetter
        {
            headerName: 'sumSq(score)',
            field: 'score',
            aggFunc: 'sumOfSquares',
            groupRowValueSetter: sumOfSquaresValueSetter,
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        sortable: true,
        filter: true,
        resizable: true,

        // Enable editing on all columns (leaf rows and group rows).
        // When groupRowEditable is defined, the built-in distribution
        // automatically uses the right strategy for each aggregation function.
        editable: true,
        groupRowEditable: true,
    },
    aggFuncs: {
        sumOfSquares,
    },
    autoGroupColumnDef: {
        minWidth: 200,
        cellRendererParams: { suppressCount: true },
    },
    rowData: getData(),
    groupDefaultExpanded: -1,
    getRowId: ({ data }) => data.id,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
