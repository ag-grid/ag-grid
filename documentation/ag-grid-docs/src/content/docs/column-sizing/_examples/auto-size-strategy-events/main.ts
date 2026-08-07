import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    ColumnAutoSizeModule,
    ModuleRegistry,
    PaginationModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ColumnApiModule,
    ColumnAutoSizeModule,
    ClientSideRowModelModule,
    ClientSideRowModelApiModule,
    PaginationModule,
]);

const columnDefs: ColDef[] = [
    { field: 'athlete', width: 300 },
    { field: 'country', width: 300, hide: true },
    { field: 'sport', width: 300 },
    { field: 'year', width: 300 },
];

const rowData = [
    { athlete: 'Ann', country: 'Australia', sport: 'Swimming', year: 2008 },
    { athlete: 'Bob', country: 'Belgium', sport: 'Rowing', year: 2012 },
    { athlete: 'Cal', country: 'Canada', sport: 'Judo', year: 2016 },
    { athlete: 'Dee', country: 'Denmark', sport: 'Sailing', year: 2020 },
];

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: columnDefs,
    rowData: rowData,
    pagination: true,
    paginationPageSize: 2,
    paginationPageSizeSelector: false,
    autoSizeStrategy: {
        type: 'fitCellContents',
        events: ['columnVisible', 'paginationChanged', 'modelUpdated'],
    },
};

function showCountry() {
    gridApi!.setColumnsVisible(['country'], true);
}

function widenAthlete() {
    gridApi!.applyColumnState({ state: [{ colId: 'athlete', width: 400 }] });
}

function addLongRow() {
    gridApi!.applyTransaction({
        add: [{ athlete: 'Bartholomew Montgomery-Fitzwilliam', country: 'Estonia', sport: 'Fencing', year: 2024 }],
        addIndex: 0,
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
