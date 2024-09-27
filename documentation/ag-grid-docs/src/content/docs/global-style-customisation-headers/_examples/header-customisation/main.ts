import { ClientSideRowModelModule } from 'ag-grid-community';
import type { GridApi, GridOptions } from 'ag-grid-community';
import { createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    rowData: null,
    columnDefs: [
        {
            headerName: 'Group 1',
            children: [{ field: 'athlete', minWidth: 170 }, { field: 'age' }],
        },
        {
            headerName: 'Group 2',
            children: [
                { field: 'country' },
                { field: 'year' },
                { field: 'date' },
                { field: 'sport' },
                { field: 'gold' },
                { field: 'silver' },
                { field: 'bronze' },
                { field: 'total' },
            ],
        },
    ],
    defaultColDef: {
        editable: true,
        filter: true,
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
