import type { ColDef, GetRowIdParams, GridApi, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberEditorModule,
    TextEditorModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { FormulaModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    FormulaModule,
    NumberEditorModule,
    TextEditorModule,
    ValidationModule,
]);

let gridApi: GridApi;

const valueFormatter = ({ value }: ValueFormatterParams) => `$ ${Number(value).toFixed(2)}`;
const getRowId = (params: GetRowIdParams) => String(params.data.id);

const columnDefs: ColDef[] = [
    { field: 'product' },
    { field: 'price', valueFormatter: valueFormatter },
    { field: 'quantity', headerName: 'Qty', maxWidth: 100 },
    { field: 'subtotal', valueFormatter: valueFormatter, allowFormula: true },
    { field: 'tax', headerName: 'Tax (10%)', valueFormatter: valueFormatter, allowFormula: true },
    { field: 'total', valueFormatter: valueFormatter, allowFormula: true },
];

const gridOptions: GridOptions = {
    columnDefs,
    getRowId,
    defaultColDef: {
        editable: true,
        flex: 1,
    },
    rowData: [
        {
            id: 1,
            product: 'Apples',
            price: 1.25,
            quantity: 4,
            subtotal: '=REF(COLUMN("price"),ROW(1))*REF(COLUMN("quantity"),ROW(1))',
            tax: '=REF(COLUMN("subtotal"),ROW(1))*0.1',
            total: '=REF(COLUMN("subtotal"),ROW(1))+REF(COLUMN("tax"),ROW(1))',
        },
        {
            id: 2,
            product: 'Oranges',
            price: 0.8,
            quantity: 6,
            subtotal: '=REF(COLUMN("price"),ROW(2))*REF(COLUMN("quantity"),ROW(2))',
            tax: '=REF(COLUMN("subtotal"),ROW(2))*0.1',
            total: '=REF(COLUMN("subtotal"),ROW(2))+REF(COLUMN("tax"),ROW(2))',
        },
        {
            id: 3,
            product: 'Bananas',
            price: 0.5,
            quantity: 10,
            subtotal: '=REF(COLUMN("price"),ROW(3))*REF(COLUMN("quantity"),ROW(3))',
            tax: '=REF(COLUMN("subtotal"),ROW(3))*0.1',
            total: '=REF(COLUMN("subtotal"),ROW(3))+REF(COLUMN("tax"),ROW(3))',
        },
        {
            id: 4,
            product: 'Grapes',
            price: 2.1,
            quantity: 3,
            subtotal: '=REF(COLUMN("price"),ROW(4))*REF(COLUMN("quantity"),ROW(4))',
            tax: '=REF(COLUMN("subtotal"),ROW(4))*0.1',
            total: '=REF(COLUMN("subtotal"),ROW(4))+REF(COLUMN("tax"),ROW(4))',
        },
        {
            id: 5,
            product: 'Plums',
            price: 1.5,
            quantity: 2,
            subtotal: '=REF(COLUMN("price"),ROW(5))*REF(COLUMN("quantity"),ROW(5))',
            tax: '=REF(COLUMN("subtotal"),ROW(5))*0.1',
            total: '=REF(COLUMN("subtotal"),ROW(5))+REF(COLUMN("tax"),ROW(5))',
        },
        {
            id: 6,
            product: 'Peaches',
            price: 1,
            quantity: 3,
            subtotal: '=REF(COLUMN("price"),ROW(6))*REF(COLUMN("quantity"),ROW(6))',
            tax: '=REF(COLUMN("subtotal"),ROW(6))*0.1',
            total: '=REF(COLUMN("subtotal"),ROW(6))+REF(COLUMN("tax"),ROW(6))',
        },
        {
            id: 7,
            product: 'Mangos',
            price: 2.45,
            quantity: 1,
            subtotal: '=REF(COLUMN("price"),ROW(7))*REF(COLUMN("quantity"),ROW(7))',
            tax: '=REF(COLUMN("subtotal"),ROW(7))*0.1',
            total: '=REF(COLUMN("subtotal"),ROW(7))+REF(COLUMN("tax"),ROW(7))',
        },
        {
            id: 8,
            product: 'Strawberries',
            price: 1.8,
            quantity: 4,
            subtotal: '=REF(COLUMN("price"),ROW(8))*REF(COLUMN("quantity"),ROW(8))',
            tax: '=REF(COLUMN("subtotal"),ROW(8))*0.1',
            total: '=REF(COLUMN("subtotal"),ROW(8))+REF(COLUMN("tax"),ROW(8))',
        },
    ],
};

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
