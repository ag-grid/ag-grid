import type { ColDef, GetRowIdFunc, GridApi, GridOptions, ValueFormatterFunc } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberEditorModule,
    RowApiModule,
    TextEditorModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { FormulaModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    RowApiModule,
    FormulaModule,
    NumberEditorModule,
    TextEditorModule,
    ValidationModule,
]);

type RowData = {
    id: string;
    product: string;
    price: number;
    quantity: number;
    subtotal?: string | number;
    total?: string | number;
};

let gridApi: GridApi<RowData>;

function seeRowData() {
    gridApi.forEachNode((node) =>
        console.log(`Row ${node.rowIndex}, ID: ${node.id}, Data: ${JSON.stringify(node.data)}`)
    );
}

function seeFormulas() {
    if (formulaStore.size === 0) {
        console.log('No formulas in store');
    } else {
        console.log('Stored formulas:');
        formulaStore.forEach((value, key) => console.log(`Key: ${key}, Formula: ${value}`));
    }
}

const currencyFormatter: ValueFormatterFunc<RowData> = ({ value }) => `$ ${Number(value ?? 0).toFixed(2)}`;
const getRowId: GetRowIdFunc<RowData> = (params) => String(params.data.id);

// Simple in-memory store to keep formulas outside rowData
const formulaStore = new Map<string, string>();
const formulaKey = (rowId: string, colId: string) => `${rowId}-${colId}`;

const columnDefs: ColDef<RowData>[] = [
    { field: 'product' },
    { field: 'price', valueFormatter: currencyFormatter },
    { field: 'quantity', maxWidth: 120 },
    { field: 'subtotal', allowFormula: true, valueFormatter: currencyFormatter },
    { field: 'total', allowFormula: true, valueFormatter: currencyFormatter },
];

const rowData: RowData[] = [
    { id: 'a_01', product: 'Apples', price: 1.2, quantity: 5 },
    { id: 'o_02', product: 'Oranges', price: 0.8, quantity: 8 },
    { id: 'b_03', product: 'Bananas', price: 0.6, quantity: 10 },
];

const gridOptions: GridOptions<RowData> = {
    columnDefs,
    rowData,
    getRowId,
    defaultColDef: {
        editable: true,
        flex: 1,
    },
    // Store formulas externally so rowData stays raw
    formulaDataSource: {
        getFormula: ({ column, rowNode }) => {
            return formulaStore.get(formulaKey(rowNode.id!, column.getColId()));
        },
        setFormula: ({ column, rowNode, formula }) => {
            const key = formulaKey(rowNode.id!, column.getColId());
            if (formula === undefined) {
                formulaStore.delete(key);
            } else {
                formulaStore.set(key, formula);
            }
        },
    },
};

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
