import type {
    GridOptions,
    IRowNode,
    ValueFormatterParams,
    ValueParserParams,
    ValueSetterParams,
} from 'ag-grid-community';
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

const amountValueSetter = ({ node, newValue }: ValueSetterParams<SalesRecord>): boolean => {
    const numericValue = Number(newValue);
    if (!Number.isFinite(numericValue)) {
        return false; // reject invalid values
    }

    // Updates the current node. Passing 'set-raw-data-field' as the source to avoid
    // re-entering this setter when the grid updates group totals.
    let updated = node.setDataValue('amount', numericValue, 'set-raw-data-field');

    const children = node.childrenAfterFilter ?? node.childrenAfterGroup;
    if (children) {
        const perChild = newValue / children.length;
        for (const child of children) {
            // set value, this will recursively update group totals if the child is a group
            if (child.setDataValue('amount', perChild)) {
                updated = true;
            }
        }
    }

    return updated;
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
            valueSetter: amountValueSetter,
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
    enableGroupEdit: true,
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
