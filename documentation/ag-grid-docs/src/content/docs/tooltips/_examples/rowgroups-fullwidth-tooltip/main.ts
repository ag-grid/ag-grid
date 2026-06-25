import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    TooltipModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([TooltipModule, ClientSideRowModelModule, RowGroupingModule]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        {
            field: 'country',
            rowGroup: true,
            hide: true,
            // shown on the full-width group row inherited from this colDef
            tooltipValueGetter: (params) => `Country: ${params.value}`,
        },
        {
            field: 'year',
            rowGroup: true,
            hide: true,
            // shown on the full-width group row inherited from this colDef
            tooltipValueGetter: (params) => `Year: ${params.value}`,
        },
        { field: 'athlete' },
        { field: 'sport' },
        { field: 'total' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    tooltipShowDelay: 500,
    groupDisplayType: 'groupRows',
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
