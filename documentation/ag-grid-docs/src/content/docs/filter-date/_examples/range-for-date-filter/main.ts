import type { ColDef, GridApi, GridOptions, IDateFilterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateFilterModule,
    ModuleRegistry,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';

import { getData } from './data';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    DateFilterModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

const columnDefs: ColDef[] = [
    {
        field: 'startDate',
        filterParams: {
            minValidDate: '2000-01-01',
            maxValidDate: tomorrow,
        } as IDateFilterParams,
    },
    {
        field: 'endDate',
        filterParams: {
            minValidYear: 2010,
            maxValidYear: 2030,
        } as IDateFilterParams,
    },
];

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        filter: true,
    },
    rowData: getData(),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
