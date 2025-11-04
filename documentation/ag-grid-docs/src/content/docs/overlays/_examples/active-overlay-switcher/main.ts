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

let gridApi: GridApi<IAthlete> | undefined;

const gridOptions: GridOptions<IAthlete> = {
    defaultColDef: {
        editable: true,
        flex: 1,
        minWidth: 120,
        filter: true,
    },
    columnDefs,
    rowData,
    components: {
        statusOverlay: StatusOverlay,
    },
    activeOverlayParams: {
        heading: 'Overlay message',
        message: 'Use the buttons to pick which overlay should be visible.',
    },
};

function showLoadingOverlay() {
    gridApi?.setGridOption('loading', false);
    gridApi?.setGridOption('activeOverlayParams', {
        heading: 'Loading data',
        message: 'Showing the built-in loading overlay via activeOverlay.',
    });
    gridApi?.setGridOption('activeOverlay', 'agLoadingOverlay');
}

function showNoRowsOverlay() {
    gridApi?.setGridOption('loading', false);
    gridApi?.setGridOption('activeOverlayParams', {
        heading: 'No rows',
        message: 'Displaying the built-in no-rows overlay via activeOverlay.',
    });
    gridApi?.setGridOption('activeOverlay', 'agNoRowsOverlay');
}

function showStatusOverlay() {
    gridApi?.setGridOption('loading', false);
    gridApi?.setGridOption('activeOverlayParams', {
        heading: 'Scheduled maintenance',
        message: 'This overlay comes from the components map using the key "statusOverlay".',
    });
    gridApi?.setGridOption('activeOverlay', 'statusOverlay');
}

function hideOverlay() {
    gridApi?.setGridOption('loading', false);
    gridApi?.setGridOption('activeOverlayParams', undefined);
    gridApi?.setGridOption('activeOverlay', undefined);
}

window.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid');
    if (!gridDiv) {
        return;
    }
    gridApi = createGrid(gridDiv, gridOptions);

    Object.assign(window, {
        showLoadingOverlay,
        showNoRowsOverlay,
        showStatusOverlay,
        hideOverlay,
    });
});
