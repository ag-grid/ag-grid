import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';

import { CustomHeader } from './customHeader_typescript';

ModuleRegistry.registerModules([CommunityFeaturesModule, ClientSideRowModelModule]);

const columnDefs: ColDef[] = [
    { field: 'athlete', headerName: "Athlete's Full Name", suppressHeaderMenuButton: true, minWidth: 120 },
    {
        field: 'age',
        headerName: "Athlete's Age",
        sortable: false,
        headerComponentParams: { menuIcon: 'fa-external-link-alt' },
    },
    { field: 'country', headerName: "Athlete's Country", suppressHeaderMenuButton: true, minWidth: 120 },
    { field: 'year', headerName: 'Event Year', sortable: false },
    { field: 'date', headerName: 'Event Date', suppressHeaderMenuButton: true },
    { field: 'sport', sortable: false },
    {
        field: 'gold',
        headerName: 'Gold Medals',
        headerComponentParams: { menuIcon: 'fa-cog' },
        minWidth: 120,
    },
    { field: 'silver', headerName: 'Silver Medals', sortable: false },
    { field: 'bronze', headerName: 'Bronze Medals', suppressHeaderMenuButton: true, minWidth: 120 },
    { field: 'total', headerName: 'Total Medals', sortable: false },
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
        filter: true,
        width: 120,
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
