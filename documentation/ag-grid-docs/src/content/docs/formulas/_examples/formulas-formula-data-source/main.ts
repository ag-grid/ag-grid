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
// .. initialise with some initial formulas.
// .. Note: formulas in the grid are normalised into the long-hand format as shown below. As such, when using
//          an external data store, formulas will be stored in this long-hand format. Users can and should continue
//          to use the short-hand format.
//          See https://ag-grid.com/javascript-data-grid/formulas/#long-form-references for more.
const formulaStore = new Map<string, string>([
    [formulaKey('a_01', 'total'), '=REF(COLUMN("price"),ROW("a_01"))*REF(COLUMN("quantity"),ROW("a_01"))'],
    [formulaKey('o_02', 'total'), '=REF(COLUMN("price"),ROW("o_02"))*REF(COLUMN("quantity"),ROW("o_02"))'],
    [formulaKey('b_03', 'total'), '=REF(COLUMN("price"),ROW("b_03"))*REF(COLUMN("quantity"),ROW("b_03"))'],
    [formulaKey('g_04', 'total'), '=REF(COLUMN("price"),ROW("g_04"))*REF(COLUMN("quantity"),ROW("g_04"))'],
    [formulaKey('p_05', 'total'), '=REF(COLUMN("price"),ROW("p_05"))*REF(COLUMN("quantity"),ROW("p_05"))'],
    [formulaKey('p_06', 'total'), '=REF(COLUMN("price"),ROW("p_06"))*REF(COLUMN("quantity"),ROW("p_06"))'],
    [formulaKey('m_07', 'total'), '=REF(COLUMN("price"),ROW("m_07"))*REF(COLUMN("quantity"),ROW("m_07"))'],
    [formulaKey('s_08', 'total'), '=REF(COLUMN("price"),ROW("s_08"))*REF(COLUMN("quantity"),ROW("s_08"))'],
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
