import type { GridOptions, GroupRowValueSetterFunc, ValueFormatterParams, ValueParserParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { RowGroupingModule, SetFilterModule } from 'ag-grid-enterprise';

import { getData } from './data';

interface SalesRecord {
    id: string;
    region: string;
    segment: string;
    country: string;
    amount: number;
}

ModuleRegistry.registerModules([
    RowGroupingModule,
    ClientSideRowModelModule,
    NumberFilterModule,
    SetFilterModule,
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

const amountGroupRowValueSetter: GroupRowValueSetterFunc<SalesRecord> = ({ node, newValue, eventSource }) => {
    const numericValue = Number(newValue);
    if (!Number.isFinite(numericValue)) {
        return false;
    }

    let result = false;
    // distribute the new value equally amongst all filtered children
    const children = node.childrenAfterSort;
    if (children?.length) {
        const perChild = numericValue / children.length;
        for (const child of children) {
            // If child is a leaf, setDataValue will update the underlying data item
            // If child is a group, setDataValue will recursively call this value setter down the tree to update group values
            if (child.setDataValue('amount', perChild, eventSource)) {
                result = true;
            }
        }
    }
    return result;
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
            groupRowValueSetter: amountGroupRowValueSetter,
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
    const gridDiv = document.querySelector<HTMLElement>('#myGrid');
    if (!gridDiv) {
        return;
    }
    createGrid(gridDiv, gridOptions);
});
