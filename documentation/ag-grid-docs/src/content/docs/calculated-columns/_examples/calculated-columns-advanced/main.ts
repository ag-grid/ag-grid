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
    { account: 'Crestline Foods', region: 'EMEA', revenue: 167000, cost: 121000 },
    { account: 'Harbor Freight Co', region: 'Americas', revenue: 142000, cost: 99000 },
    { account: 'Atlas Mining', region: 'APAC', revenue: 251000, cost: 197000 },
    { account: 'Veridian Health', region: 'EMEA', revenue: 173000, cost: 128000 },
    { account: 'Quantum Software', region: 'Americas', revenue: 298000, cost: 176000 },
    { account: 'Redwood Hotels', region: 'APAC', revenue: 132000, cost: 104000 },
    { account: 'Ironbridge Steel', region: 'EMEA', revenue: 221000, cost: 183000 },
    { account: 'Lakeside Media', region: 'Americas', revenue: 96000, cost: 71000 },
    { account: 'Polar Shipping', region: 'EMEA', revenue: 188000, cost: 142000 },
    { account: 'Granite Insurance', region: 'Americas', revenue: 204000, cost: 149000 },
    { account: 'Cobalt Mining', region: 'APAC', revenue: 243000, cost: 186000 },
    { account: 'Meridian Airlines', region: 'EMEA', revenue: 312000, cost: 268000 },
    { account: 'Oakfield Farms', region: 'Americas', revenue: 87000, cost: 62000 },
    { account: 'Silverline Bank', region: 'APAC', revenue: 265000, cost: 191000 },
    { account: 'Horizon Telecom', region: 'EMEA', revenue: 154000, cost: 112000 },
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
