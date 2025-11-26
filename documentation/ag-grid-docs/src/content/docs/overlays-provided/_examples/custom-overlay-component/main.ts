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
    { field: 'country', width: 120 },
];

let gridApi: GridApi<IAthlete>;

const gridOptions: GridOptions<IAthlete> = {
    defaultColDef: {
        editable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
    },

    loading: true,

    columnDefs: columnDefs,
    rowData: [],

    overlayComponent: CustomOverlay,
    overlayComponentParams: {
        loadingMessage: 'Custom loading message',
        noRowsMessage: 'Custom no rows message',
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
