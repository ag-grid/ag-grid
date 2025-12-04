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

const formulaKey = (rowId: string, colId: string) => `${rowId}-${colId}`;
// Simple in-memory store to keep formulas outside rowData
// .. initialise with some initial formulas
const formulaStore = new Map<string, string>([
    [formulaKey('a_01', 'total'), '=B1*C1'],
    [formulaKey('o_02', 'total'), '=B2*C2'],
    [formulaKey('b_03', 'total'), '=B3*C3'],
    [formulaKey('g_04', 'total'), '=B4*C4'],
    [formulaKey('p_05', 'total'), '=B5*C5'],
    [formulaKey('p_06', 'total'), '=B6*C6'],
    [formulaKey('m_07', 'total'), '=B7*C7'],
    [formulaKey('s_08', 'total'), '=B8*C8'],
]);

const columnDefs: ColDef<RowData>[] = [
    { field: 'product' },
    { field: 'price', valueFormatter: currencyFormatter },
    { field: 'quantity', maxWidth: 120 },
    { field: 'total', allowFormula: true, valueFormatter: currencyFormatter },
];

const rowData: RowData[] = [
    { id: 'a_01', product: 'Apples', price: 1.2, quantity: 5 },
    { id: 'o_02', product: 'Oranges', price: 0.8, quantity: 8 },
    { id: 'b_03', product: 'Bananas', price: 1.6, quantity: 1 },
    { id: 'g_04', product: 'Grapes', price: 1, quantity: 2 },
    { id: 'p_05', product: 'Plums', price: 0.4, quantity: 18 },
    { id: 'p_06', product: 'Peaches', price: 1.6, quantity: 4 },
    { id: 'm_07', product: 'Mangos', price: 2.2, quantity: 5 },
    { id: 's_08', product: 'Strawberries', price: 0.8, quantity: 8 },
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
