import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { CalculatedColumnsModule, ColumnMenuModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, CalculatedColumnsModule, ColumnMenuModule]);

interface Employee {
    employee: string;
    salary: number;
    sales: number;
}

const gridOptions: GridOptions<Employee> = {
    columnDefs: [
        { field: 'employee' },
        { field: 'salary' },
        { field: 'sales' },
        { colId: 'bonus', headerName: 'Bonus', calculatedExpression: '[salary] * 0.1', cellDataType: 'number' },
        { colId: 'target', headerName: 'Sales Target', calculatedExpression: '[sales] * 1.2', cellDataType: 'number' },
    ],
    rowData: [
        { employee: 'Alex Morgan', salary: 50000, sales: 100000 },
        { employee: 'Sam Taylor', salary: 60000, sales: 125000 },
        { employee: 'Jamie Lee', salary: 55000, sales: 110000 },
    ],
    calculatedColumns: {
        isColumnReferenceable: ({ colDef, calculatedColumn }) =>
            colDef.field !== 'salary' || calculatedColumn?.getColId() === 'bonus',
    },
    defaultColDef: { flex: 1, minWidth: 120 },
};

document.addEventListener('DOMContentLoaded', () => {
    createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
});
