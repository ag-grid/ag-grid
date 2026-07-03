import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    AutoGenerateColumnsModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, AutoGenerateColumnsModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    autoGenerateColumnDefs: true,
    rowData: [
        { name: 'Alice', address: { city: 'London', country: 'UK' }, scores: { maths: 92, science: 88 } },
        { name: 'Bob', address: { city: 'Paris', country: 'France' }, scores: { maths: 75, science: 91 } },
        { name: 'Charlie', address: { city: 'Berlin', country: 'Germany' }, scores: { maths: 84, science: 79 } },
        { name: 'Diana', address: { city: 'Madrid', country: 'Spain' }, scores: { maths: 96, science: 85 } },
        { name: 'Eve', address: { city: 'Rome', country: 'Italy' }, scores: { maths: 68, science: 94 } },
    ],
};

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
