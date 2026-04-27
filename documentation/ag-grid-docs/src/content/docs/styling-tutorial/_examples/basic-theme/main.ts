import type { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    RowSelectionModule,
    TextFilterModule,
    createGrid,
    themeQuartz,
} from 'ag-grid-community';

import { type IProduct, getData } from './data';

ModuleRegistry.registerModules([RowSelectionModule, TextFilterModule, NumberFilterModule, ClientSideRowModelModule]);

const myTheme = themeQuartz;

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
    rowSelection: {
        mode: 'multiRow',
    },
};

createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
