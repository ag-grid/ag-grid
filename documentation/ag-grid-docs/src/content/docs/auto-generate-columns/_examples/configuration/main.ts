import type { AutoGenerateColumnDefsOptions, GridApi, GridOptions } from 'ag-grid-community';
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

const config: AutoGenerateColumnDefsOptions = {
    objectValues: 'group',
    arrayValues: 'primitives',
    nullishValues: 'include',
};

const rowData = [
    { name: 'Alice', age: 32, address: { city: 'London', country: 'UK' }, roles: ['admin', 'user'], notes: null },
    { name: 'Bob', age: 28, address: { city: 'Paris', country: 'France' }, roles: ['user'], notes: null },
    { name: 'Charlie', age: 35, address: { city: 'Berlin', country: 'Germany' }, roles: ['admin'], notes: null },
    {
        name: 'Diana',
        age: 24,
        address: { city: 'Madrid', country: 'Spain' },
        roles: ['user', 'moderator'],
        notes: null,
    },
    { name: 'Eve', age: 29, address: { city: 'Rome', country: 'Italy' }, roles: ['admin', 'moderator'], notes: null },
];

const gridOptions: GridOptions = {
    autoGenerateColumnDefs: { ...config },
    rowData,
};

function onObjectValues(): void {
    const value = (document.getElementById('objectValues') as HTMLSelectElement).value;
    config.objectValues = value as AutoGenerateColumnDefsOptions['objectValues'];
    gridApi.setGridOption('autoGenerateColumnDefs', { ...config });
}

function onArrayValues(): void {
    const value = (document.getElementById('arrayValues') as HTMLSelectElement).value;
    config.arrayValues = value as AutoGenerateColumnDefsOptions['arrayValues'];
    gridApi.setGridOption('autoGenerateColumnDefs', { ...config });
}

function onNullishValues(): void {
    const value = (document.getElementById('nullishValues') as HTMLSelectElement).value;
    config.nullishValues = value as AutoGenerateColumnDefsOptions['nullishValues'];
    gridApi.setGridOption('autoGenerateColumnDefs', { ...config });
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
