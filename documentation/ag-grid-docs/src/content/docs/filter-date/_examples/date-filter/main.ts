import type { ColDef, GridApi, GridOptions, ValueFormatterParams } from 'ag-grid-community';
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
        field: 'startDateTime',
        filter: 'agDateColumnFilter',
        cellDataType: 'dateTime',
        valueFormatter: (params: ValueFormatterParams) =>
            params.value.toISOString().replace(/[TZ]/g, ' ').trim().slice(0, -4),
    },
    {
        field: 'endDateTime',
        filter: 'agDateColumnFilter',
        valueFormatter: (params: ValueFormatterParams) => params.value.replace(/[TZ]/g, ' ').trim().slice(0, -4),
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
