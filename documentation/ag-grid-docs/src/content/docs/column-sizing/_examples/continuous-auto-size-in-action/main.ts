import type { ColGroupDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
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

ModuleRegistry.registerModules([ColumnAutoSizeModule, PaginationModule, ClientSideRowModelModule]);

const columnDefs: ColGroupDef<IOlympicData>[] = [
    {
        headerName: 'Competitor',
        children: [{ field: 'athlete' }, { field: 'age' }, { field: 'country' }],
    },
    {
        headerName: 'Event',
        children: [{ field: 'sport' }, { field: 'year' }, { field: 'date' }],
    },
    {
        headerName: 'Medals',
        children: [{ field: 'gold' }, { field: 'silver' }, { field: 'bronze' }, { field: 'total' }],
    },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    pagination: true,
    paginationPageSize: 20,
    paginationPageSizeSelector: [20, 50, 100],
    autoSizeStrategy: {
        type: 'fitCellContents',
        continuous: true,
    },
    // `fitCellContents` can only measure the columns that are rendered, so every column has to be
    // rendered for all ten to re-fit around each page's content rather than only once scrolled into view
    suppressColumnVirtualisation: true,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
