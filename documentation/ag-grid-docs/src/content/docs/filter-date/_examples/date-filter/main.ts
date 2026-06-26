import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateFilterModule,
    ModuleRegistry,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';

import { getData } from './data';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, DateFilterModule]);
const columnDefs: ColDef[] = [
    {
        field: 'startDate',
        filter: true,
    },
    {
        field: 'endDate',
        filter: 'agDateColumnFilter',
    },
    {
        // Data contains a Date object
        field: 'startDateTime',
        filter: 'agDateColumnFilter',
        cellDataType: 'dateTime',
    },
    {
        // Data contains an ISO string format
        field: 'endDateTime',
        filter: 'agDateColumnFilter',
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
