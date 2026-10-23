import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    PaginationModule,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, NumberFilterModule, PaginationModule, TextFilterModule]);

let gridApi: GridApi;

function getGridOptions(enableShadowDom: boolean): GridOptions {
    return {
        columnDefs: [{ field: 'country' }, { field: 'sport' }, { field: 'gold' }, { field: 'silver' }],
        defaultColDef: { flex: 1, filter: true, floatingFilter: true },
        rowData: [
            { country: 'France', sport: 'Cycling', gold: 5, silver: 3 },
            { country: 'Spain', sport: 'Sailing', gold: 2, silver: 4 },
            { country: 'Italy', sport: 'Fencing', gold: 4, silver: 2 },
            { country: 'Japan', sport: 'Judo', gold: 3, silver: 1 },
            { country: 'Canada', sport: 'Rowing', gold: 1, silver: 2 },
        ],
        pagination: true,
        enableShadowDom,
    };
}

function toggleProperty() {
    const enableShadowDom = document.querySelector<HTMLInputElement>('#enableShadowDom')!.checked;
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;

    gridApi.destroy();
    gridApi = createGrid(gridDiv, getGridOptions(enableShadowDom));
}

document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, getGridOptions(false));
});
