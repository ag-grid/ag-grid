import type { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { CalculatedColumnsModule, ColumnMenuModule } from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    CalculatedColumnsModule,
    ColumnMenuModule,
    NumberFilterModule,
    TextFilterModule,
]);

type SalesRow = {
    account: string;
    revenue: number;
    cost: number;
};

const formatter = (params: ValueFormatterParams<SalesRow, number>, formattedString: string): string => {
    const { value } = params;
    if (value == null) {
        return '';
    }

    if (String(value).startsWith('#')) {
        return String(value);
    }

    return formattedString;
};

const currencyFormatter = (params: ValueFormatterParams<SalesRow, number>) =>
    formatter(params, `$${(params.value ?? '').toLocaleString()}`);

const percentageFormatter = (params: ValueFormatterParams<SalesRow, number>) =>
    formatter(params, `${Math.round((params.value ?? 0) * 100)}%`);

const columnDefs: ColDef<SalesRow>[] = [
    { field: 'account', flex: 1.4 },
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
    { account: 'Northwind Energy', revenue: 245000, cost: 172000 },
    { account: 'Summit Retail', revenue: 186000, cost: 151000 },
    { account: 'Pioneer Logistics', revenue: 214000, cost: 139000 },
    { account: 'Apex Manufacturing', revenue: 198000, cost: 158000 },
    { account: 'Blue River Telecom', revenue: 276000, cost: 192000 },
    { account: 'Crestline Foods', revenue: 167000, cost: 121000 },
    { account: 'Harbor Freight Co', revenue: 142000, cost: 99000 },
    { account: 'Atlas Mining', revenue: 251000, cost: 197000 },
    { account: 'Veridian Health', revenue: 173000, cost: 128000 },
    { account: 'Quantum Software', revenue: 298000, cost: 176000 },
    { account: 'Redwood Hotels', revenue: 132000, cost: 104000 },
    { account: 'Ironbridge Steel', revenue: 221000, cost: 183000 },
    { account: 'Lakeside Media', revenue: 96000, cost: 71000 },
    { account: 'Polar Shipping', revenue: 188000, cost: 142000 },
    { account: 'Granite Insurance', revenue: 204000, cost: 149000 },
    { account: 'Cobalt Mining', revenue: 243000, cost: 186000 },
    { account: 'Meridian Airlines', revenue: 312000, cost: 268000 },
    { account: 'Oakfield Farms', revenue: 87000, cost: 62000 },
    { account: 'Silverline Bank', revenue: 265000, cost: 191000 },
    { account: 'Horizon Telecom', revenue: 154000, cost: 112000 },
];

const gridOptions: GridOptions<SalesRow> = {
    columnDefs,
    rowData,
    calculatedColumns: true,
    defaultColDef: {
        flex: 1,
        minWidth: 130,
    },
};

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    createGrid(gridDiv, gridOptions);
});
