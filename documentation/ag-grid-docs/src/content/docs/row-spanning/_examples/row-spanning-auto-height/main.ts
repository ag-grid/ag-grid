import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    CellSpanModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    RowAutoHeightModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';

ModuleRegistry.registerModules([
    CellSpanModule,
    ClientSideRowModelModule,
    RowAutoHeightModule,
    ValidationModule /* Development Only */,
]);

const lorem = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`;

const columnDefs: ColDef[] = [
    { field: 'lorem', spanRows: true, wrapText: true, autoHeight: true, minWidth: 300 },
    { field: 'athlete' },
    { field: 'age' },
    { field: 'total' },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
    },
    enableCellSpan: true,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: any[]) => {
            data.forEach((row, i) => {
                if (i % 3 === 0) {
                    return;
                }
                row.lorem = lorem;
            });
            gridApi!.setGridOption('rowData', data);
        });
});
