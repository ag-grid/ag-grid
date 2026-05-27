import type { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { CalculatedColumnsModule, ColumnMenuModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    CalculatedColumnsModule,
    ColumnMenuModule,
    NumberFilterModule,
    TextFilterModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

type SalesRow = {
    account: string;
    region: string;
    revenue: number;
    cost: number;
};

const currencyFormatter = (params: ValueFormatterParams<SalesRow, number>) =>
    params.value == null ? '' : `$${params.value.toLocaleString()}`;

const percentageFormatter = (params: ValueFormatterParams<SalesRow, number>) =>
    params.value == null ? '' : `${Math.round(params.value * 100)}%`;

const columnDefs: ColDef<SalesRow>[] = [
    { field: 'account', flex: 1.4 },
    { field: 'region', filter: 'agTextColumnFilter' },
    {
        field: 'revenue',
        valueFormatter: currencyFormatter,
    },
    {
        field: 'cost',
        valueFormatter: currencyFormatter,
    },
    {
        colId: 'profit',
        headerName: 'Profit',
        calculatedExpression: '[revenue] - [cost]',
        cellDataType: 'number',
        sortable: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: currencyFormatter,
    },
    {
        colId: 'margin',
        headerName: 'Margin',
        calculatedExpression: '[profit] / [revenue]',
        cellDataType: 'number',
        sortable: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: percentageFormatter,
    },
    {
        colId: 'status',
        headerName: 'Status',
        calculatedExpression: 'IF([margin] >= 0.25, "Healthy", "Review")',
        cellDataType: 'text',
        sortable: true,
        filter: 'agTextColumnFilter',
    },
];

const rowData: SalesRow[] = [
    { account: 'Northwind Energy', region: 'EMEA', revenue: 245000, cost: 172000 },
    { account: 'Summit Retail', region: 'APAC', revenue: 186000, cost: 151000 },
    { account: 'Pioneer Logistics', region: 'Americas', revenue: 214000, cost: 139000 },
    { account: 'Apex Manufacturing', region: 'EMEA', revenue: 198000, cost: 158000 },
    { account: 'Blue River Telecom', region: 'Americas', revenue: 276000, cost: 192000 },
];

const gridOptions: GridOptions<SalesRow> = {
    columnDefs,
    rowData,
    defaultColDef: {
        flex: 1,
        minWidth: 130,
    },
};

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    createGrid(gridDiv, gridOptions);
});
