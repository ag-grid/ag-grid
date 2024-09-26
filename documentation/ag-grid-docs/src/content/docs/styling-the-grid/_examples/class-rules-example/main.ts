import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
    type CellClassRules,
    type ColDef,
    type GridApi,
    type GridOptions,
    ModuleRegistry,
    type RowClassParams,
    type RowClassRules,
    createGrid,
} from '@ag-grid-community/core';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';

import type { CellClassParams } from '../../../../../../../../packages/ag-grid-community/dist/types/core/main';
import { getData } from './data';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

// Row Data Interface
interface IRow {
    productName: string;
    salesRevenue: number;
    profitMargin: number;
    status: string;
}

const statusCellClassRules: CellClassRules = {
    'status-delivered': (params: CellClassParams) => params.data.status === 'Delivered',
    'status-pending': (params: CellClassParams) => params.data.status === 'Pending',
    'status-cancelled': (params: CellClassParams) => params.data.status === 'Cancelled',
};

const salesRevenueRowClassRules: RowClassRules = {
    'high-sales': (params: RowClassParams) => params.data.salesRevenue > 10000,
    'low-sales': (params: RowClassParams) => params.data.salesRevenue < 1000,
};

// Column Definitions: Defines & controls grid columns.
const colDefs: ColDef[] = [
    { field: 'productName', headerName: 'Product Name', checkboxSelection: true },
    { field: 'salesRevenue', headerName: 'Sales Revenue' },
    { field: 'profitMargin', headerName: 'Profit Margin' },
    {
        field: 'status',
        headerName: 'Status',
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
            values: ['Delivered', 'Pending', 'Cancelled'],
        },
        cellClassRules: statusCellClassRules,
    },
];

// Apply settings across all columns
const defaultColDef: ColDef = {
    filter: true,
    editable: true,
};

// Grid options to configure the grid
const gridOptions: GridOptions<IRow> = {
    columnDefs: colDefs,
    defaultColDef: defaultColDef,
    rowData: getData(),
    pagination: true,
    paginationPageSize: 50,
    rowSelection: 'multiple',
    autoSizeStrategy: { type: 'fitGridWidth' },
    rowClassRules: salesRevenueRowClassRules,
};

// Initialize the grid after the page has loaded
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.getElementById('myGrid')!;
    createGrid(gridDiv, gridOptions);
});
