import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';

import { CustomNoRowsOverlay } from './customNoRowsOverlay_typescript';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

interface IAthlete {
    athlete: string;
    country: string;
}

const columnDefs: ColDef[] = [{ field: 'athlete' }, { field: 'country' }];

let gridApi: GridApi<IAthlete>;

const gridOptions: GridOptions<IAthlete> = {
    defaultColDef: {
        flex: 1,
    },

    columnDefs: columnDefs,
    rowData: [],

    noRowsOverlayComponent: CustomNoRowsOverlay,
    noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => 'No rows found at: ' + new Date().toLocaleTimeString(),
    },
};

function onBtnClearRowData() {
    gridApi!.setGridOption('rowData', []);
}

function onBtnSetRowData() {
    gridApi!.setGridOption('rowData', [{ athlete: 'Michael Phelps', country: 'US' }]);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
