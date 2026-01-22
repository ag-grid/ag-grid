import type { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, createGrid, themeQuartz } from 'ag-grid-community';

import { type IProduct, getData } from './data';

ModuleRegistry.registerModules([AllCommunityModule]);

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
    theme: themeQuartz,
    columnDefs,
    defaultColDef,
    rowData: getData(),
};

createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
