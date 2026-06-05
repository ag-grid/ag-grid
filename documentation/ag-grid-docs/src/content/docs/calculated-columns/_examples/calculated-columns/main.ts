import type { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberEditorModule,
    NumberFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { CalculatedColumnsModule, ColumnMenuModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    CalculatedColumnsModule,
    ColumnMenuModule,
    NumberEditorModule,
    NumberFilterModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

type SalesRow = {
    product: string;
    revenue: number;
    cost: number;
};

const currencyFormatter = (params: ValueFormatterParams<SalesRow, number>) =>
    params.value == null ? '' : `$${params.value.toLocaleString()}`;

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
