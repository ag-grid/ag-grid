import type { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberEditorModule,
    NumberFilterModule,
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
    NumberEditorModule,
    NumberFilterModule,
]);

type SalesRow = {
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

const columnDefs: ColDef<SalesRow>[] = [
    { field: 'product', flex: 1 },
    {
        field: 'revenue',
        editable: true,
        valueFormatter: currencyFormatter,
    },
    {
        field: 'cost',
        editable: true,
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
];

const rowData: SalesRow[] = [
    { product: 'Solar panel kit', revenue: 142000, cost: 96000 },
    { product: 'Smart thermostat', revenue: 78000, cost: 52000 },
    { product: 'Battery pack', revenue: 126000, cost: 101000 },
    { product: 'EV charger', revenue: 92000, cost: 61000 },
    { product: 'Heat pump', revenue: 168000, cost: 119000 },
    { product: 'Inverter unit', revenue: 88000, cost: 57000 },
    { product: 'Wind turbine kit', revenue: 232000, cost: 171000 },
    { product: 'Solar tile roof', revenue: 198000, cost: 144000 },
    { product: 'Power optimiser', revenue: 64000, cost: 41000 },
    { product: 'Charge controller', revenue: 53000, cost: 33000 },
    { product: 'Energy monitor', revenue: 47000, cost: 29000 },
    { product: 'Storage cabinet', revenue: 71000, cost: 52000 },
    { product: 'Microinverter', revenue: 59000, cost: 37000 },
    { product: 'Heat recovery unit', revenue: 124000, cost: 88000 },
    { product: 'Hybrid boiler', revenue: 156000, cost: 117000 },
    { product: 'Smart meter', revenue: 39000, cost: 24000 },
    { product: 'Insulation pack', revenue: 44000, cost: 27000 },
    { product: 'EV cable set', revenue: 31000, cost: 18000 },
    { product: 'Solar pump', revenue: 67000, cost: 45000 },
    { product: 'Backup generator', revenue: 173000, cost: 131000 },
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
