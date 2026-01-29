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
 * groupRowValueSetter that distributes the edited value equally among aggregated children.
 * For pivot columns, `aggregatedChildren` contains only children matching the pivot keys.
 */
const amountGroupRowValueSetter: GroupRowValueSetterFunc<SalesRecord> = ({
    column,
    newValue,
    eventSource,
    aggregatedChildren,
}) => {
    const numericValue = Number(newValue);
    if (!Number.isFinite(numericValue)) {
        return false;
    }

    let result = false;
    // Use aggregatedChildren - for pivot columns this contains only children matching the pivot keys
    const children = aggregatedChildren;
    if (children?.length) {
        const perChild = numericValue / children.length;
        for (const child of children) {
            // setDataValue with the column automatically resolves pivot columns to the value column for leaf rows
            if (child.setDataValue(column, perChild, eventSource)) {
                result = true;
            }
        }
    }
    return result;
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
            groupRowValueSetter: amountGroupRowValueSetter,
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
