import type { GridOptions, GroupRowValueSetterFunc, ValueFormatterParams, ValueParserParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    TextEditorModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { ColumnsToolPanelModule, PivotModule, RowGroupingModule, SideBarModule } from 'ag-grid-enterprise';

import type { SalesRecord } from './data';
import { getData } from './data';

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

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
});

const amountValueFormatter = (params: ValueFormatterParams): string =>
    typeof params.value === 'number' ? currencyFormatter.format(params.value) : params.value ?? '';

const amountValueParser = (params: ValueParserParams): number | null => {
    const numericValue = Number(params.newValue);
    return Number.isFinite(numericValue) ? numericValue : params.oldValue ?? null;
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
    api,
    column,
    newValue,
    eventSource,
    aggregatedChildren,
}) => {
    const total = Number(newValue);
    if (!Number.isFinite(total) || !aggregatedChildren.length) {
        return false;
    }

    // Get current values using api.getValue (works for both leaf data and group aggData)
    const values = aggregatedChildren.map((child) => Number(api.getValue(column, child)) || 0);
    const sum = values.reduce((a, b) => a + b, 0);

    // Distribute proportionally, or equally if sum is zero
    let changed = false;
    for (let i = 0; i < aggregatedChildren.length; i++) {
        const share = sum ? (values[i] / sum) * total : total / aggregatedChildren.length;
        const rounded = Math.round(share * 100) / 100;
        // setDataValue on groups triggers groupRowValueSetter recursively
        if (aggregatedChildren[i].setDataValue(column, rounded, eventSource)) {
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
            headerName: 'Sales',
            field: 'amount',
            aggFunc: 'sum',
            editable: true,
            groupRowEditable: true,
            valueParser: amountValueParser,
            groupRowValueSetter: cascadeGroupTotal,
            valueFormatter: amountValueFormatter,
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
    const gridDiv = document.querySelector<HTMLElement>('#myGrid');
    if (!gridDiv) {
        return;
    }
    const gridApi = createGrid(gridDiv, gridOptions);

    // Toggle pivot mode
    document.querySelector<HTMLInputElement>('#pivotMode')?.addEventListener('change', (e) => {
        gridApi.setGridOption('pivotMode', (e.target as HTMLInputElement).checked);
    });
});
