import type { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { CalculatedColumnsModule, ColumnMenuModule, RowGroupingModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    CalculatedColumnsModule,
    ColumnMenuModule,
    RowGroupingModule,
    NumberFilterModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

type SalesRow = {
    productType: string;
    product: string;
    revenue: number;
    cost: number;
};

const currencyFormatter = (params: ValueFormatterParams<SalesRow, number>) =>
    params.value == null ? '' : `$${params.value.toLocaleString()}`;

const percentageFormatter = (params: ValueFormatterParams<SalesRow, number>) =>
    params.value == null ? '' : `${Math.round(params.value * 100)}%`;

const columnDefs: ColDef<SalesRow>[] = [
    { field: 'productType', rowGroup: true, hide: true },
    { field: 'product', flex: 1.4 },
    {
        field: 'revenue',
        aggFunc: 'sum',
        valueFormatter: currencyFormatter,
    },
    {
        field: 'cost',
        aggFunc: 'sum',
        valueFormatter: currencyFormatter,
    },
    {
        colId: 'profit',
        headerName: 'Profit',
        calculatedExpression: '[revenue] - [cost]',
        cellDataType: 'number',
        filter: 'agNumberColumnFilter',
        valueFormatter: currencyFormatter,
    },
    {
        colId: 'margin',
        headerName: 'Margin',
        calculatedExpression: '[profit] / [revenue]',
        cellDataType: 'number',
        valueFormatter: percentageFormatter,
    },
];

const rowData: SalesRow[] = [
    { productType: 'Solar', product: 'Solar panel kit', revenue: 142000, cost: 96000 },
    { productType: 'Solar', product: 'Smart thermostat', revenue: 78000, cost: 52000 },
    { productType: 'Charging', product: 'Battery pack', revenue: 126000, cost: 101000 },
    { productType: 'Charging', product: 'EV charger', revenue: 92000, cost: 61000 },
    { productType: 'Heating', product: 'Heat pump', revenue: 168000, cost: 119000 },
];

const gridOptions: GridOptions<SalesRow> = {
    columnDefs,
    rowData,
    defaultColDef: {
        flex: 1,
        minWidth: 130,
    },
    autoGroupColumnDef: {
        headerName: 'Product Type',
        minWidth: 180,
    },
    groupDefaultExpanded: -1,
};

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    createGrid(gridDiv, gridOptions);
});
