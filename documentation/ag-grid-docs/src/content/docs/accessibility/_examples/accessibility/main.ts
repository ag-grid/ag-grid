import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';

ModuleRegistry.registerModules([
    CommunityFeaturesModule,
    CommunityFeaturesModule,
    ClientSideRowModelModule,
    MenuModule,
    SetFilterModule,
]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete', minWidth: 150 },
        { field: 'age', minWidth: 50, filter: 'agNumberColumnFilter' },
        { field: 'country', width: 120 },
        { field: 'year', width: 90 },
        { field: 'date', width: 110 },
        { field: 'sport', width: 110 },
        { field: 'gold', width: 110 },
        { field: 'silver', width: 110 },
        { field: 'bronze', width: 110 },
    ],
    defaultColDef: {
        editable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
    },
    ensureDomOrder: true,
    suppressColumnVirtualisation: true,
    suppressRowVirtualisation: true,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data.slice(0, 600)));
});
