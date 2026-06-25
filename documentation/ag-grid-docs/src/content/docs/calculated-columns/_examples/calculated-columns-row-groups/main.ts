import type { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { CalculatedColumnsModule, ColumnMenuModule, RowGroupingModule } from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    CalculatedColumnsModule,
    ColumnMenuModule,
    RowGroupingModule,
    NumberFilterModule,
]);

type SalesRow = {
    productType: string;
    product: string;
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
        // aggFunc lets the calculated column aggregate its per-leaf results onto group rows.
        aggFunc: 'sum',
        cellDataType: 'number',
        filter: 'agNumberColumnFilter',
        valueFormatter: currencyFormatter,
    },
    {
        colId: 'margin',
        headerName: 'Margin',
        // No aggFunc: a ratio does not aggregate, so margin evaluates on leaf rows and is blank on groups.
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
    { productType: 'Heating', product: 'Hybrid boiler', revenue: 156000, cost: 117000 },
    { productType: 'Heating', product: 'Heat recovery unit', revenue: 124000, cost: 88000 },
    { productType: 'Storage', product: 'Storage cabinet', revenue: 71000, cost: 52000 },
    { productType: 'Storage', product: 'Lithium rack', revenue: 143000, cost: 112000 },
    { productType: 'Storage', product: 'Flow battery', revenue: 187000, cost: 149000 },
    { productType: 'Storage', product: 'Backup generator', revenue: 173000, cost: 131000 },
    { productType: 'Wind', product: 'Wind turbine kit', revenue: 232000, cost: 171000 },
    { productType: 'Wind', product: 'Micro turbine', revenue: 76000, cost: 49000 },
    { productType: 'Wind', product: 'Tower mount', revenue: 41000, cost: 26000 },
    { productType: 'Monitoring', product: 'Energy monitor', revenue: 47000, cost: 29000 },
    { productType: 'Monitoring', product: 'Smart meter', revenue: 39000, cost: 24000 },
    { productType: 'Monitoring', product: 'Grid analyser', revenue: 58000, cost: 36000 },
    { productType: 'Efficiency', product: 'Insulation pack', revenue: 44000, cost: 27000 },
    { productType: 'Efficiency', product: 'LED retrofit', revenue: 36000, cost: 21000 },
    { productType: 'Efficiency', product: 'Window film', revenue: 28000, cost: 16000 },
];

const gridOptions: GridOptions<SalesRow> = {
    columnDefs,
    rowData,
    calculatedColumns: true,
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
