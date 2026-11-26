import type { ColDef, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { CalculatedColumnsModule, ColumnMenuModule, ContextMenuModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    CalculatedColumnsModule,
    ColumnMenuModule,
    ContextMenuModule,
]);

interface SalesRow {
    product: string;
    revenue: number;
    cost: number;
}

const columnDefs: ColDef<SalesRow>[] = [
    { field: 'product' },
    { field: 'revenue' },
    { field: 'cost' },
    {
        colId: 'grossMargin',
        headerName: 'Gross Margin',
        calculatedExpression: '([revenue] - [cost]) / [revenue]',
        cellDataType: 'number',
        calculatedColumnReadOnly: true,
        valueFormatter: ({ value }) => (typeof value === 'number' ? `${(value * 100).toFixed(1)}%` : ''),
    },
    {
        colId: 'profit',
        headerName: 'Profit',
        calculatedExpression: '[revenue] - [cost]',
        cellDataType: 'number',
    },
];

const gridOptions: GridOptions<SalesRow> = {
    calculatedColumns: true,
    columnDefs,
    defaultColDef: { flex: 1, minWidth: 130 },
    rowData: [
        { product: 'Solar panel kit', revenue: 142000, cost: 96000 },
        { product: 'Smart thermostat', revenue: 78000, cost: 52000 },
        { product: 'Battery pack', revenue: 126000, cost: 101000 },
        { product: 'EV charger', revenue: 92000, cost: 61000 },
        { product: 'Heat pump', revenue: 168000, cost: 119000 },
    ],
};

document.addEventListener('DOMContentLoaded', () => {
    createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
});
