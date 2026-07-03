import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';

import { getData } from './data';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, NumberFilterModule]);

const columnDefs: ColDef[] = [
    {
        field: 'price',
        filter: true,
    },
    {
        field: 'quantity',
        filter: 'agNumberColumnFilter',
    },
];

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 150,
    },
    rowData: getData(),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
