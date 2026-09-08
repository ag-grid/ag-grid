import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    TooltipModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([TooltipModule, ClientSideRowModelModule]);

const columnDefs: ColDef[] = [
    { field: 'athlete', headerTooltip: "The athlete's name" },
    { field: 'age', headerTooltip: "The athlete's age" },
    { field: 'date', headerTooltip: 'The date of the Olympics' },
    { field: 'sport', headerTooltip: 'The sport the medal was for' },
    { field: 'gold', headerTooltip: (p) => `How many ${String(p.value).toLowerCase()} medals` },
    { field: 'silver', headerTooltip: (p) => `How many ${String(p.value).toLowerCase()} medals` },
    { field: 'bronze', headerTooltip: (p) => `How many ${String(p.value).toLowerCase()} medals` },
    { field: 'total', headerTooltip: 'The total number of medals' },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    defaultColDef: {
        width: 150,
    },
    tooltipShowDelay: 500,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
