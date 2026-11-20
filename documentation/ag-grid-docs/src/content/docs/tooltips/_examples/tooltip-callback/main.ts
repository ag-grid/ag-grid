import type { ColDef, GridApi, GridOptions, TooltipCallbackParams } from 'ag-grid-community';
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
    {
        field: 'athlete',
        // the tooltip shows another field of the same row
        tooltip: ({ data }: TooltipCallbackParams) => data?.country,
    },
    { field: 'country' },
    {
        field: 'year',
        tooltip: ({ value }: TooltipCallbackParams) => `Games held in ${value}`,
    },
    {
        field: 'sport',
        headerTooltip: ({ value }: TooltipCallbackParams) => `Column: ${value}`,
    },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    columnDefs: columnDefs,
    tooltipShowDelay: 500,
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
