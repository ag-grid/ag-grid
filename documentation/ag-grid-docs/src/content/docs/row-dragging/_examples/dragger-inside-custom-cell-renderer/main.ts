import { ClientSideRowModelModule } from 'ag-grid-community';
import { ColDef, GridApi, GridOptions, createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';

import { CustomCellRenderer } from './customCellRenderer_typescript';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const columnDefs: ColDef[] = [
    {
        field: 'athlete',
        cellClass: 'custom-athlete-cell',
        cellRenderer: CustomCellRenderer,
    },
    { field: 'country' },
    { field: 'year', width: 100 },
    { field: 'date' },
    { field: 'sport' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    defaultColDef: {
        width: 170,
        filter: true,
    },
    rowDragManaged: true,
    columnDefs: columnDefs,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
