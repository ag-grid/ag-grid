import type { GridApi, GridOptions, GroupRowValueSetterFunc, ValueParserParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    TextEditorModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { ColumnsToolPanelModule, PivotModule, RowGroupingModule, SideBarModule } from 'ag-grid-enterprise';

import { getData } from './data';

interface SalesRecord {
    id: string;
    region: string;
    country: string;
    product: string;
    amount: number;
}

let gridApi: GridApi<SalesRecord>;

ModuleRegistry.registerModules([
    RowGroupingModule,
    ClientSideRowModelModule,
    NumberFilterModule,
    TextEditorModule,
    PivotModule,
    SideBarModule,
    ColumnsToolPanelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

// Parse input to integer
const amountValueParser = (params: ValueParserParams): number | null => {
    const numericValue = Number(params.newValue);
    return Number.isFinite(numericValue) ? Math.round(numericValue) : params.oldValue ?? null;
};

/**
 * Distributes a new group/pivot total to children proportionally.
 *
 * When editing a pivot cell (e.g., "Electronics 2024"), cascades the change to
 * `aggregatedChildren` based on each child's current contribution:
 *
 * - Children with values [30, 70] (sum=100), new total 200 → [60, 140]
 * - If sum is zero, distributes equally among all children
 *
 * `aggregatedChildren` contains:
 * - For leaf groups: only rows matching the pivot keys (e.g., product="Electronics", year=2024)
 * - For non-leaf groups: the child groups (cascade continues via recursive setDataValue)
 *
 * `setDataValue` behaviour:
 * - On leaf rows with pivot columns: auto-resolves to the underlying value column
 * - On group rows: triggers `groupRowValueSetter` again for recursive cascade
 */
const cascadeGroupTotal: GroupRowValueSetterFunc<SalesRecord> = ({
    column,
    newValue,
    eventSource,
    aggregatedChildren,
}) => {
    const total = Number(newValue);
    if (!Number.isFinite(total) || !aggregatedChildren.length) {
        return false;
    }

    // Distribute equally among children
    // https://en.wikipedia.org/wiki/Largest_remainder_method
    const count = aggregatedChildren.length;
    const base = Math.floor(total / count);
    let remainder = Math.round(total) - base * count;

    // Apply the distributed values
    let changed = false;
    for (const child of aggregatedChildren) {
        let value = base;
        if (remainder > 0) {
            value++;
            remainder--;
        }
        if (child.setDataValue(column, value, eventSource)) {
            changed = true;
        }
    }
    return changed;
};

const gridOptions: GridOptions<SalesRecord> = {
    columnDefs: [
        { field: 'region', rowGroup: true, hide: true },
        { field: 'country', rowGroup: true, hide: true },
        { field: 'product', pivot: true },
        {
            headerName: 'Amount',
            field: 'amount',
            aggFunc: 'sum',
            editable: true,
            groupRowEditable: true,
            valueParser: amountValueParser,
            groupRowValueSetter: cascadeGroupTotal,
        },
    ],
    autoGroupColumnDef: {
        minWidth: 200,
        cellRendererParams: {
            suppressCount: true,
        },
    },
    defaultColDef: {
        flex: 1,
        minWidth: 120,
        sortable: true,
        filter: true,
        resizable: true,
    },
    pivotMode: true,
    sideBar: 'columns',
    rowData: getData(),
    groupDefaultExpanded: -1,
    getRowId: ({ data }) => data.id,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
