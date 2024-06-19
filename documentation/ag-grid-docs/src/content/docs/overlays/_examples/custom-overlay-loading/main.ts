import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';
import type { ColDef, GridApi, GridOptions } from '@ag-grid-community/core';

import { CustomLoadingOverlay } from './customLoadingOverlay_typescript';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const columnDefs: ColDef[] = [
    { field: 'athlete', width: 150 },
    { field: 'age', width: 90 },
    { field: 'country', width: 120 },
    { field: 'year', width: 90 },
    { field: 'date', width: 110 },
    { field: 'sport', width: 110 },
    { field: 'gold', width: 100 },
    { field: 'silver', width: 100 },
    { field: 'bronze', width: 100 },
    { field: 'total', width: 100 },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    defaultColDef: {
        editable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
    },

    loading: true,

    columnDefs: columnDefs,

    loadingOverlayComponent: CustomLoadingOverlay,
    loadingOverlayComponentParams: {
        loadingMessage: 'One moment please...',
    },
};

function setLoading(value: boolean) {
    gridApi!.setGridOption('loading', value);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
