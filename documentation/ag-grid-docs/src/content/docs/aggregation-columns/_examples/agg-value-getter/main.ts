import type { GridApi, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import type { SaleRow } from './data';
import { getData } from './data';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);

const formatCurrency = (params: ValueFormatterParams) =>
    params.value == null ? '' : `$${Number(params.value).toFixed(2)}`;

let gridApi: GridApi<SaleRow>;

const gridOptions: GridOptions<SaleRow> = {
    columnDefs: [
        { field: 'region', rowGroup: true, hide: true },
        { field: 'product' },
        { field: 'units', aggFunc: 'sum' },
        { field: 'revenue', aggFunc: 'sum', valueFormatter: formatCurrency },
        {
            field: 'unitPrice',
            aggFunc: 'avg',
            // weighted price per unit, where `avg` alone would average the unit prices
            aggValueGetter: (params) => params.aggData!.revenue / params.aggData!.units,
            valueFormatter: formatCurrency,
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 120,
    },
    autoGroupColumnDef: {
        minWidth: 160,
    },
    groupDefaultExpanded: 1,
    grandTotalRow: 'bottom',
    rowData: getData(),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
