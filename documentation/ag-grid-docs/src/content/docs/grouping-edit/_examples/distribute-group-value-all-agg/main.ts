import type { GridApi, GridOptions, GroupRowValueSetterFunc, IAggFunc, IAggFuncParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberEditorModule,
    NumberFilterModule,
    TextEditorModule,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { RowGroupingEditModule, RowGroupingModule } from 'ag-grid-enterprise';

import type { MetricsRecord } from './data';
import { getData } from './data';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    RowGroupingModule,
    RowGroupingEditModule,
    ClientSideRowModelModule,
    NumberEditorModule,
    TextEditorModule,
    NumberFilterModule,
    TextFilterModule,
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

/**
 * Cross-column groupRowValueSetter: editing the group row's "Rate %"
 * sets each leaf child's bonus to a percentage of their individual salary.
 *
 * Uses getAggregatedChildren with recursive=true to reach all descendant
 * leaf rows, since intermediate group rows don't have salary data.
 *
 * For example, entering 20 on the Engineering group sets each engineer's
 * bonus to 20% of their salary: Alice (salary 90) gets bonus 18,
 * Dave (salary 95) gets bonus 19, etc.
 */
const bonusRateSetter: GroupRowValueSetterFunc<MetricsRecord> = ({ newValue, node, column }) => {
    const rate = Number(newValue) / 100;
    if (!Number.isFinite(rate)) {
        return false;
    }
    const leaves = node.getAggregatedChildren(column, true);
    if (!leaves.length) {
        return false;
    }
    let changed = false;
    for (const child of leaves) {
        const salary = child.data?.salary ?? 0;
        if (child.setDataValue('bonus', Math.round(salary * rate), 'data')) {
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

        // avg: default strategy is 'overwrite' — sets every child to the edited value
        {
            field: 'bonus',
            aggFunc: 'avg',
            valueFormatter: ({ value }) => (value != null ? Number(value).toFixed(2) : ''),
        },

        // No aggFunc: the default strategy is 'overwrite', writing the edited
        // value to every child. The group cell is blank (no aggregation) but
        // still editable via groupRowEditable.
        { field: 'projects' },

        // Cross-column custom callback: editing the group row's "Rate"
        // reads each child's salary and writes a computed bonus.
        {
            headerName: 'Rate %',
            valueGetter: ({ data }) => (data ? (data.bonus / data.salary) * 100 : null),
            valueFormatter: ({ value }) => (value != null ? Number(value).toFixed(2) : ''),
            aggFunc: 'avg',
            editable: false,
            groupRowEditable: true,
            groupRowValueSetter: bonusRateSetter,
        },

        // Custom aggregation function with a custom groupRowValueSetter
        {
            headerName: 'SumSq',
            field: 'score',
            aggFunc: 'sumOfSquares',
            groupRowValueSetter: sumOfSquaresValueSetter,
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 120,
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
