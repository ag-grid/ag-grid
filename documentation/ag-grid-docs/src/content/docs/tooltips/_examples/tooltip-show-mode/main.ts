import type { ColDef, ColGroupDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    TooltipModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';

ModuleRegistry.registerModules([
    TooltipModule,
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const columnDefs: (ColDef | ColGroupDef)[] = [
    {
        field: 'athlete',
        tooltipField: 'athlete',
        width: 130,
    },
    {
        field: 'country',
        tooltipField: 'country',
        headerName: 'Country of Athlete',
        headerTooltip: 'Country of Athlete',
        width: 100,
    },
    {
        field: 'sport',
        tooltipField: 'sport',
    },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs,
    tooltipShowDelay: 500,
    tooltipShowMode: 'whenTruncated',
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
