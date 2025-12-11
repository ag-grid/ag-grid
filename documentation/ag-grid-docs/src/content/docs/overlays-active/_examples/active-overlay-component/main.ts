import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';

import type { CustomParams } from './customOverlay_typescript';
import { CustomOverlay } from './customOverlay_typescript';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

interface IAthlete {
    athlete: string;
    country: string;
}

const columnDefs: ColDef[] = [
    { field: 'athlete', flex: 1 },
    { field: 'country', flex: 1 },
];

const rowData: IAthlete[] = [
    { athlete: 'Michael Phelps', country: 'United States' },
    { athlete: 'Natalie Coughlin', country: 'United States' },
    { athlete: 'Aleksey Nemov', country: 'Russia' },
    { athlete: 'Alicia Coutts', country: 'Australia' },
];

let gridApi: GridApi<IAthlete>;

const activeOverlayParams: CustomParams = {
    count: 1,
};

const gridOptions: GridOptions<IAthlete> = {
    columnDefs,
    rowData,
    activeOverlay: CustomOverlay,
    activeOverlayParams,
};

function showActiveOverlay() {
    gridApi.setGridOption('activeOverlay', CustomOverlay);
}

function clearActiveOverlay() {
    gridApi.setGridOption('activeOverlay', undefined);
}
function incParam() {
    activeOverlayParams.count++;
    gridApi.setGridOption('activeOverlayParams', activeOverlayParams);
}

// setup the grid after the page has finished loading
window.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
