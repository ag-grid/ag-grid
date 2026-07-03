import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import type { ColDef } from 'ag-grid-community';

import { StatusOverlay } from './statusOverlay_typescript';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface IAthlete {
    athlete: string;
    country: string;
}

const columnDefs: ColDef<IAthlete>[] = [
    { field: 'athlete', flex: 1 },
    { field: 'country', flex: 1 },
];

const rowData: IAthlete[] = [
    { athlete: 'Michael Phelps', country: 'United States' },
    { athlete: 'Alicia Coutts', country: 'Australia' },
];

let gridApi: GridApi<IAthlete>;
let statusOverlayCounter = 0;

const gridOptions: GridOptions<IAthlete> = {
    columnDefs,
    rowData,
    components: {
        statusOverlay: StatusOverlay,
    },
};

function showNoRowsOverlay() {
    gridApi.updateGridOptions({
        activeOverlay: 'agNoRowsOverlay',
        activeOverlayParams: undefined,
    });
}

function showStatusOverlay() {
    gridApi.updateGridOptions({
        activeOverlay: 'statusOverlay',
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

function setLoading(isChecked: boolean) {
    gridApi.updateGridOptions({
        loading: isChecked ? true : undefined,
    });
}

window.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    const loadingToggle = document.querySelector<HTMLInputElement>('#loading-toggle');
    if (loadingToggle) {
        loadingToggle.addEventListener('change', () => setLoading(loadingToggle.checked));
        setLoading(loadingToggle.checked);
    }
});
