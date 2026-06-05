import type { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { CalculatedColumnsModule, ColumnMenuModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    CalculatedColumnsModule,
    ColumnMenuModule,
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
    { field: 'product', flex: 1.3 },
    { field: 'revenue', valueFormatter: currencyFormatter },
    { field: 'cost', valueFormatter: currencyFormatter },
    {
        colId: 'profit',
        headerName: 'Profit',
        calculatedExpression: '[revenue] - [cost]',
        cellDataType: 'number',
        filter: 'agNumberColumnFilter',
        valueFormatter: currencyFormatter,
    },
];

const rowData: SalesRow[] = [
    { product: 'Solar panel kit', revenue: 142000, cost: 96000 },
    { product: 'Smart thermostat', revenue: 78000, cost: 52000 },
    { product: 'Battery pack', revenue: 126000, cost: 101000 },
    { product: 'EV charger', revenue: 92000, cost: 61000 },
];

const gridOptions: GridOptions<SalesRow> = {
    columnDefs,
    rowData,
    calculatedColumns: {
        suppressColumnHighlighting: true,
    },
    defaultColDef: {
        flex: 1,
        minWidth: 130,
    },
    onFirstDataRendered: (params) => {
        params.api.openCalculatedColumnDialog('profit');
    },
};

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    createGrid(gridDiv, gridOptions);
});
