import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    CellStyleModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([CellStyleModule, ClientSideRowModelModule]);

const columnDefs: ColDef[] = [
    { field: 'athlete', sort: 'asc', sortIndex: 1 },
    { field: 'country', sort: 'asc', sortIndex: 0 },
    { field: 'gold', type: 'rightAligned', sort: 'desc', sortIndex: 2 },
    { field: 'year' },
    { field: 'sport' },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
    },
    multiSortIndexStyle: 'inline',
};

function setSortIndexStyle(style: 'inline' | 'superscript' | 'subscript') {
    gridApi!.setGridOption('multiSortIndexStyle', style);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
