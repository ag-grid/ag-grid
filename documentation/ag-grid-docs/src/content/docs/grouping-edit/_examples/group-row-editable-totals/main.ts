import type {
    GridApi,
    GridOptions,
    GroupRowValueSetterFunc,
    ValueFormatterParams,
    ValueParserParams,
} from 'ag-grid-community';
import {
    CellApiModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    TextEditorModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { RowGroupingModule, SetFilterModule } from 'ag-grid-enterprise';

import { getData } from './data';

let gridApi: GridApi<SalesRecord>;

interface SalesRecord {
    id: string;
    region: string;
    segment: string;
    country: string;
    amount: number;
}

ModuleRegistry.registerModules([
    CellApiModule,
    RowGroupingModule,
    ClientSideRowModelModule,
    NumberFilterModule,
    SetFilterModule,
    TextEditorModule,
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
 * Distributes a new group total to children proportionally.
 *
 * When editing a group cell, cascades the change to `aggregatedChildren` based on
 * each child's current contribution:
 *
 * - Children with values [30, 70] (sum=100), new total 200 → [60, 140]
 * - If sum is zero, distributes equally among all children
 *
 * `aggregatedChildren` contains:
 * - For leaf groups: the data rows that contribute to the aggregation
 * - For non-leaf groups: the child groups (cascade continues via recursive setDataValue)
 *
 * `setDataValue` on a child group triggers `groupRowValueSetter` again, enabling
 * full tree traversal from any group level.
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

    // Get current values using api.getCellValue (works for both leaf data and group aggData)
    // Use from: 'data' to read actual stored values, not pending edits
    const values = aggregatedChildren.map(
        (child) => Number(api.getCellValue({ colKey: column, rowNode: child, from: 'data' })) || 0
    );
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
        { field: 'segment', rowGroup: true, hide: true, filter: 'agSetColumnFilter' },
        { field: 'country', filter: 'agSetColumnFilter' },
        {
            headerName: 'Annual Budget',
            field: 'amount',
            aggFunc: 'sum',
            editable: true,
            groupRowEditable: true,
            filter: 'agNumberColumnFilter',
            valueParser: amountValueParser,
            groupRowValueSetter: cascadeGroupTotal,
            valueFormatter: amountValueFormatter,
        },
    ],
    autoGroupColumnDef: {
        minWidth: 260,
        cellRendererParams: {
            suppressCount: true,
        },
    },
    defaultColDef: {
        flex: 1,
        sortable: true,
        filter: true,
        resizable: true,
    },
    rowData: getData(),
    groupAggFiltering: true,
    groupDefaultExpanded: -1,
    animateRows: true,
    getRowId: ({ data }) => data.id,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
