import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnHoverModule,
    ModuleRegistry,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([ColumnHoverModule, ClientSideRowModelModule]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        {
            headerName: 'Participant',
            children: [{ field: 'athlete' }, { field: 'age' }],
        },
        {
            headerName: 'Details',
            children: [{ field: 'country' }, { field: 'year' }, { field: 'date' }, { field: 'sport' }],
        },
    ],
    defaultColDef: {
        flex: 1,
    },
    columnHoverHighlight: true,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
