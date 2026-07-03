import type { ColDef, GetRowIdParams, GridApi, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberEditorModule,
    TextEditorModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { CellSelectionModule, FormulaModule } from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    CellSelectionModule,
    ClientSideRowModelModule,
    FormulaModule,
    NumberEditorModule,
    TextEditorModule,
]);

let gridApi: GridApi;

const valueFormatter = ({ value }: ValueFormatterParams) => {
    if (typeof value === 'string' && value.startsWith('#')) {
        return value;
    }
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? `$ ${numericValue.toFixed(2)}` : String(value ?? '');
};
const getRowId = (params: GetRowIdParams) => String(params.data.id);

const columnDefs: ColDef[] = [
    { field: 'item' },
    { field: 'price', valueFormatter: valueFormatter },
    { field: 'qty' },
    {
        field: 'total',
        allowFormula: true,
        valueFormatter: valueFormatter,
        cellEditorParams: {
            validateFormulas: true,
        },
    },
];

const gridOptions: GridOptions = {
    columnDefs,
    getRowId,
    cellSelection: {
        handle: {
            mode: 'fill',
        },
    },
    defaultColDef: {
        editable: true,
        flex: 1,
    },
    rowData: [
        {
            id: 1,
            item: 'Apples',
            price: 1.2,
            qty: 4,
            total: '=REF(COLUMN("price"),ROW(1))*REF(COLUMN("qty"),ROW(1))',
        },
        {
            id: 2,
            item: 'Bananas',
            price: 0.5,
            qty: 6,
            total: '=B2*',
        },
        {
            id: 3,
            item: 'Oranges',
            price: 0.8,
            qty: 3,
            total: '=REF(COLUMN("price"),ROW(3))*REF(COLUMN("qty"),ROW(3))',
        },
        {
            id: 4,
            item: 'Pears',
            price: 1.4,
            qty: 2,
            total: '=REF(COLUMN("price"),ROW(4))*REF(COLUMN("qty"),ROW(4))',
        },
        {
            id: 5,
            item: 'Grapes',
            price: 2.1,
            qty: 3,
            total: '=BADFUNC(1)',
        },
        {
            id: 6,
            item: 'Plums',
            price: 1.5,
            qty: 2,
            total: '=REF(COLUMN("price"),ROW(6))*REF(COLUMN("qty"),ROW(6))',
        },
        {
            id: 7,
            item: 'Strawberries',
            price: 1.8,
            qty: 4,
            total: '=REF(COLUMN("price"),ROW(7))*REF(COLUMN("qty"),ROW(7))',
        },
    ],
};

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
