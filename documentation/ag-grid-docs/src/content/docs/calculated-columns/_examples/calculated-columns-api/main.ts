import type { ColDef, GridApi, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ModuleRegistry,
    NumberFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { CalculatedColumnsModule } from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    CalculatedColumnsModule,
    ColumnApiModule,
    NumberFilterModule,
]);

type SalesRow = {
    product: string;
    revenue: number;
    cost: number;
};

const currencyFormatter = (params: ValueFormatterParams<SalesRow, number>) =>
    params.value == null ? '' : `$${params.value.toLocaleString()}`;

const percentFormatter = (params: ValueFormatterParams<SalesRow, number>) =>
    params.value == null ? '' : `${(params.value * 100).toFixed(1)}%`;

const marginColumn: ColDef<SalesRow> = {
    colId: 'profitMargin',
    headerName: 'Profit Margin',
    calculatedExpression: '([revenue] - [cost]) / [revenue]',
    cellDataType: 'number',
    valueFormatter: percentFormatter,
};

const columnDefs: ColDef<SalesRow>[] = [
    { field: 'product', flex: 1 },
    { field: 'revenue', valueFormatter: currencyFormatter },
    { field: 'cost', valueFormatter: currencyFormatter },
    {
        colId: 'profit',
        headerName: 'Profit',
        calculatedExpression: '[revenue] - [cost]',
        cellDataType: 'number',
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

let gridApi: GridApi<SalesRow>;

const gridOptions: GridOptions<SalesRow> = {
    columnDefs,
    rowData,
    calculatedColumns: true,
    defaultColDef: {
        flex: 1,
        minWidth: 130,
    },
};

// Get: read the calculated columns currently in the grid.
function logCalculatedColumns() {
    const calculatedColumns = (gridApi.getColumns() ?? []).filter(
        (column) => column.getColDef().calculatedExpression !== undefined
    );
    console.log(
        '### Calculated columns ###',
        calculatedColumns.map((column) => column.getColId())
    );
}

// Set: add a calculated column by updating the columnDefs grid option.
function addMarginColumn() {
    const colDefs = gridApi.getColumnDefs() ?? [];
    if (colDefs.some((colDef) => 'colId' in colDef && colDef.colId === 'profitMargin')) {
        return;
    }
    gridApi.setGridOption('columnDefs', [...colDefs, marginColumn]);
}

// Edit: change an existing calculated column's expression.
function editMarginExpression() {
    const colDefs = gridApi.getColumnDefs() ?? [];
    gridApi.setGridOption(
        'columnDefs',
        colDefs.map((colDef) =>
            'colId' in colDef && colDef.colId === 'profitMargin'
                ? { ...colDef, calculatedExpression: '([revenue] - [cost]) / [cost]' }
                : colDef
        )
    );
}

// Remove: drop a calculated column from the columnDefs grid option.
function removeMarginColumn() {
    const colDefs = gridApi.getColumnDefs() ?? [];
    gridApi.setGridOption(
        'columnDefs',
        colDefs.filter((colDef) => !('colId' in colDef && colDef.colId === 'profitMargin'))
    );
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
