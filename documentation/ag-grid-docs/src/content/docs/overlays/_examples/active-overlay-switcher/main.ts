import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    TextEditorModule,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';

import { StatusOverlay } from './statusOverlay_typescript';

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

const columnDefs: ColDef<IAthlete>[] = [
    { field: 'athlete', width: 150 },
    { field: 'country', width: 150 },
];

const rowData: IAthlete[] = [
    { athlete: 'Michael Phelps', country: 'United States' },
    { athlete: 'Alicia Coutts', country: 'Australia' },
];

let gridApi: GridApi<IAthlete>;
let statusOverlayCounter = 0;

const gridOptions: GridOptions<IAthlete> = {
    defaultColDef: {
        flex: 1,
        minWidth: 120,
    },
    columnDefs,
    rowData,
    activeOverlay: StatusOverlay,
    activeOverlayParams: {
        myCounter: ++statusOverlayCounter,
    },
};

function showStatusOverlay() {
    gridApi.updateGridOptions({
        activeOverlay: StatusOverlay,
        activeOverlayParams: {
            myCounter: ++statusOverlayCounter,
        },
    });
}

function hideOverlay() {
    gridApi.updateGridOptions({
        activeOverlay: undefined,
        activeOverlayParams: undefined,
    });
}

window.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
