import type { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, createGrid, iconSetMaterial, themeQuartz } from 'ag-grid-community';

import { type IProduct, getData } from './data';

ModuleRegistry.registerModules([AllCommunityModule]);

// Customise the theme with parameters
const myTheme = themeQuartz.withPart(iconSetMaterial).withParams({
    accentColor: '#0e4491',
    backgroundColor: '#ffffff',
    foregroundColor: '#1a1a1a',
    headerBackgroundColor: '#faf8f5',
    spacing: 10,
    fontSize: 12,
    headerFontSize: 14,
});

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
    { field: 'status' },
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
    rowData: getData(),
};

createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
