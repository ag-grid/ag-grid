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
        { colId: 'bonus', headerName: 'Sales Bonus', calculatedExpression: '[sales] * 0.1', cellDataType: 'number' },
    ],
    rowData: [
        { employee: 'Alex Morgan', salary: 50000, sales: 100000 },
        { employee: 'Sam Taylor', salary: 60000, sales: 125000 },
        { employee: 'Jamie Lee', salary: 55000, sales: 110000 },
    ],
    calculatedColumns: {
        applyMode: 'deferred',
        getValidationErrors: ({ referencedColumns, internalErrors }) =>
            referencedColumns.some((column) => column.getColId() === 'salary')
                ? ['Salary cannot be used in this report.', 'Choose a sales-based expression.']
                : internalErrors,
    },
    defaultColDef: { flex: 1, minWidth: 120 },
};

document.addEventListener('DOMContentLoaded', () => {
    createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
});
