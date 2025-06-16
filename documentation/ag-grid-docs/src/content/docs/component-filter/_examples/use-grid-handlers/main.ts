import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomFilterModule,
    ModuleRegistry,
    NumberFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';

import { YearFilter } from './yearFilter_typescript';

ModuleRegistry.registerModules([
    CustomFilterModule,
    NumberFilterModule,
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const columnDefs: ColDef[] = [
    {
        field: 'athlete',
        minWidth: 150,
    },
    {
        field: 'year',
        headerName: 'Year Default',
        minWidth: 130,
        filter: { component: YearFilter, handler: 'agNumberColumnFilterHandler' },
    },
    {
        field: 'year',
        headerName: 'Year Apply',
        minWidth: 130,
        filter: { component: YearFilter, handler: 'agNumberColumnFilterHandler' },
        filterParams: {
            useForm: true,
            buttons: ['apply'],
            closeOnApply: true,
        },
    },
    { field: 'sport' },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    columnDefs: columnDefs,
    enableFilterHandlers: true,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data) => {
            gridApi!.setGridOption('rowData', data);
        });
});
