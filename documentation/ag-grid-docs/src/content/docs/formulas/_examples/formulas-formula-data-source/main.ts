import type { ColDef, GetRowIdParams, GridOptions } from 'ag-grid-community';
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

type RowData = {
    id: number;
    product: string;
    price: number;
    quantity: number;
    subtotal?: string | number;
    total?: string | number;
};

function seeRowData() {
    rowData.forEach((rec) => {
        console.log(rec);
    });
}

function seeFormulas() {
    formulaStore.forEach((value, formula) => console.log(value, formula));
}

const valueFormatter = ({ value }: { value: number }) => `$ ${Number(value ?? 0).toFixed(2)}`;
const getRowId = (params: GetRowIdParams) => String(params.data.id);

// Simple in-memory store to keep formulas outside rowData
const formulaStore = new Map<string, string>();
const formulaKey = (rowId: string, colId: string) => `${rowId}-${colId}`;

const columnDefs: ColDef<RowData>[] = [
    { field: 'product' },
    { field: 'price', valueFormatter },
    { field: 'quantity', maxWidth: 120 },
    { field: 'subtotal', allowFormula: true, valueFormatter },
    { field: 'total', allowFormula: true, valueFormatter },
];

const rowData: RowData[] = [
    { id: 1, product: 'Apples', price: 1.2, quantity: 5 },
    { id: 2, product: 'Oranges', price: 0.8, quantity: 8 },
    { id: 3, product: 'Bananas', price: 0.6, quantity: 10 },
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
    createGrid(gridDiv, gridOptions);
});
