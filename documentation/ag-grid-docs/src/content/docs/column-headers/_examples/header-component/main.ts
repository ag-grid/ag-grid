import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';

import { CustomHeader } from './customHeader_typescript';

ModuleRegistry.registerModules([CommunityFeaturesModule, ClientSideRowModelModule]);

const columnDefs: ColDef[] = [
    { field: 'athlete', suppressHeaderMenuButton: true, minWidth: 120 },
    {
        field: 'age',
        sortable: false,
        headerComponentParams: { menuIcon: 'fa-external-link-alt' },
    },
    { field: 'country', suppressHeaderMenuButton: true, minWidth: 120 },
    { field: 'year', sortable: false },
    { field: 'date', suppressHeaderMenuButton: true },
    { field: 'sport', sortable: false },
    {
        field: 'gold',
        headerComponentParams: { menuIcon: 'fa-cog' },
        minWidth: 120,
    },
    { field: 'silver', sortable: false },
    { field: 'bronze', suppressHeaderMenuButton: true, minWidth: 120 },
    { field: 'total', sortable: false },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    rowData: null,
    suppressMenuHide: true,
    components: {
        agColumnHeader: CustomHeader,
    },
    defaultColDef: {
        editable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        headerComponentParams: {
            menuIcon: 'fa-bars',
        },
    },
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
