import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';

// PLACEHOLDER MAIN FILE NOT ACTUALLY USED IN THE EXAMPLE AS VUE3 PROVIDED EXAMPLES ONLY
if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface IRow {
    name: string;
    category: string;
    price: number;
}

let gridApi: GridApi<IRow>;

const gridOptions: GridOptions<IRow> = {
    defaultColDef: {
        flex: 1,
        minWidth: 120,
    },
    columnDefs: [
        { field: 'name', headerName: 'Product', flex: 2 },
        { field: 'category' },
        {
            field: 'price',
            cellRenderer: (params) => `£${params.value.toFixed(2)}`,
        },
    ],
    rowData: [
        { name: 'Wireless Mouse', category: 'Electronics', price: 24.99 },
        { name: 'Standing Desk', category: 'Furniture', price: 349.0 },
        { name: 'Coffee Mug', category: 'Kitchen', price: 9.5 },
        { name: 'Desk Lamp', category: 'Furniture', price: 34.99 },
        { name: 'Mechanical Keyboard', category: 'Electronics', price: 89.99 },
        { name: 'Bookshelf', category: 'Furniture', price: 120 },
    ],
};

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
