import type { GridApi, GridOptions, GroupRowValueSetterFunc, ValueParserParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    TextEditorModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { RowGroupingEditModule, RowGroupingModule, SetFilterModule } from 'ag-grid-enterprise';

import { getData } from './data';

let gridApi: GridApi<SalesRecord>;

interface SalesRecord {
    id: string;
    region: string;
    segment: string;
    country: string;
    amount: number;
}

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    RowGroupingModule,
    RowGroupingEditModule,
    ClientSideRowModelModule,
    NumberFilterModule,
    SetFilterModule,
    TextEditorModule,
]);

// Parse input to integer
const amountValueParser = (params: ValueParserParams): number | null => {
    const numericValue = Number(params.newValue);
    return Number.isFinite(numericValue) ? Math.round(numericValue) : (params.oldValue ?? null);
};

/**
 * Distributes a new group total equally among children.
 *
 * `aggregatedChildren` contains the immediate children used for aggregation:
 * - For leaf groups: the data rows
 * - For non-leaf groups: the child groups
 *
 * Calling `setDataValue` on a child group triggers `groupRowValueSetter` again,
 * enabling recursive cascade through the entire group hierarchy.
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
        { field: 'segment', rowGroup: true, hide: true, filter: 'agSetColumnFilter' },
        { field: 'country', filter: 'agSetColumnFilter' },
        {
            headerName: 'Amount',
            field: 'amount',
            aggFunc: 'sum',
            editable: true,
            groupRowEditable: true,
            filter: 'agNumberColumnFilter',
            valueParser: amountValueParser,
            groupRowValueSetter: cascadeGroupTotal,
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
