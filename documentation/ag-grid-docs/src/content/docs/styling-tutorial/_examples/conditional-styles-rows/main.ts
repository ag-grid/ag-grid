import type { CellClassRules, ColDef, GridOptions, RowClassRules, ValueFormatterParams } from 'ag-grid-community';
import {
    CellStyleModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    RowSelectionModule,
    RowStyleModule,
    TextFilterModule,
    createGrid,
    iconSetMaterial,
    themeQuartz,
} from 'ag-grid-community';

import { type IProduct, getData } from './data';

ModuleRegistry.registerModules([
    CellStyleModule,
    ClientSideRowModelModule,
    NumberFilterModule,
    RowSelectionModule,
    RowStyleModule,
    TextFilterModule,
]);

// Create a theme with light and dark modes
const myTheme = themeQuartz
    .withPart(iconSetMaterial)
    .withParams(
        {
            backgroundColor: '#ffffff',
            foregroundColor: '#1a1a1a',
            headerBackgroundColor: '#faf8f5',
            selectedRowBackgroundColor: 'rgba(14, 68, 145, 0.15)',
            spacing: 10,
            fontSize: 12,
            headerFontSize: 14,
        },
        'light'
    )
    .withParams(
        {
            backgroundColor: '#1e1e2f',
            foregroundColor: '#e2e8f0',
            headerBackgroundColor: '#2d2d44',
            selectedRowBackgroundColor: 'rgba(110, 168, 254, 0.2)',
            spacing: 10,
            fontSize: 12,
            headerFontSize: 14,
        },
        'dark'
    );

// Cell class rules for status column
const statusCellClassRules: CellClassRules = {
    'status-delivered': (params) => params.value === 'Delivered',
    'status-pending': (params) => params.value === 'Pending',
    'status-cancelled': (params) => params.value === 'Cancelled',
};

// Row class rules for highlighting sales performance
const salesRowClassRules: RowClassRules<IProduct> = {
    'high-sales': (params) => (params.data?.salesRevenue ?? 0) > 10000,
};

const columnDefs: ColDef<IProduct>[] = [
    { field: 'productName', headerName: 'Product', minWidth: 180 },
    {
        field: 'salesRevenue',
        headerName: 'Revenue',
        valueFormatter: (params: ValueFormatterParams) =>
            params.value != null ? `$${params.value.toLocaleString()}` : '',
    },
    {
        field: 'profitMargin',
        headerName: 'Margin',
        valueFormatter: (params: ValueFormatterParams) =>
            params.value != null ? `${(params.value * 100).toFixed(0)}%` : '',
    },
    {
        field: 'status',
        cellClassRules: statusCellClassRules,
    },
];

const defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
    filter: true,
};

const gridOptions: GridOptions<IProduct> = {
    theme: myTheme,
    columnDefs,
    defaultColDef,
    rowClassRules: salesRowClassRules,
    rowSelection: {
        mode: 'multiRow',
    },
    rowData: getData(),
};

// Dark mode toggle logic
const toggleButton = document.querySelector<HTMLElement>('#toggle')!;

function setThemeMode() {
    const isDark = document.body.dataset.agThemeMode === 'dark';
    const nextMode = isDark ? 'light' : 'dark';

    document.body.dataset.agThemeMode = nextMode;
    toggleButton.innerText = nextMode === 'dark' ? 'Enable Light Mode' : 'Enable Dark Mode';
}

// Set initial mode
document.body.dataset.agThemeMode = 'light';

createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
