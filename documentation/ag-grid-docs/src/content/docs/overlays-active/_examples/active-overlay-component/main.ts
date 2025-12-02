import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    TextEditorModule,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';

import { CustomOverlay } from './customOverlay_typescript';

ModuleRegistry.registerModules([
    TextEditorModule,
    TextFilterModule,
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

interface IAthlete {
    athlete: string;
    country: string;
}

const columnDefs: ColDef[] = [
    { field: 'athlete', width: 150 },
    { field: 'country', width: 150 },
];

const rowData: IAthlete[] = [
    { athlete: 'Michael Phelps', country: 'United States' },
    { athlete: 'Natalie Coughlin', country: 'United States' },
    { athlete: 'Aleksey Nemov', country: 'Russia' },
    { athlete: 'Alicia Coutts', country: 'Australia' },
];

let gridApi: GridApi<IAthlete>;

const gridOptions: GridOptions<IAthlete> = {
    defaultColDef: {
        flex: 1,
        minWidth: 120,
    },
    columnDefs,
    rowData,
};

function showActiveOverlay() {
    gridApi.setGridOption('activeOverlay', CustomOverlay);
}

function clearActiveOverlay() {
    gridApi.setGridOption('activeOverlay', undefined);
}

// setup the grid after the page has finished loading
window.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
