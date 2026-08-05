import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
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

ModuleRegistry.registerModules([ColumnApiModule, ColumnAutoSizeModule, PaginationModule, ClientSideRowModelModule]);

const columnDefs: ColDef[] = [
    { field: 'athlete', minWidth: 80 },
    { field: 'age', minWidth: 80 },
    { field: 'country', minWidth: 80 },
    { field: 'year', minWidth: 80 },
    { field: 'date', minWidth: 80 },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    pagination: true,
    paginationPageSize: 10,
    paginationPageSizeSelector: [10, 20, 50],
    autoSizeStrategy: {
        type: 'fitCellContents',
        events: ['paginationChanged', 'columnVisible'],
    },
};

function toggleCountry() {
    const column = gridApi!.getColumn('country');
    gridApi!.setColumnsVisible(['country'], !column!.isVisible());
}

function reapplyStrategy() {
    gridApi!.applyAutoSizeStrategy();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
