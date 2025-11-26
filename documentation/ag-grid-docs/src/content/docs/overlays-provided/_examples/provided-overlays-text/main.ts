import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    TextFilterModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

interface IAthlete {
    athlete: string;
    country: string;
}

let gridApi: GridApi<IAthlete>;

const gridOptions: GridOptions<IAthlete> = {
    loading: true,
    defaultColDef: {
        filter: true,
    },
    columnDefs: [{ field: 'athlete' }, { field: 'country' }],
    overlayComponentParams: {
        // Override the default text for provided overlays
        agLoadingOverlayText: 'Please wait while your data is loading...',
        agNoRowsOverlayText: 'This grid has no data!',
        agNoMatchingRowsOverlayText: 'Current Filter Matches No Rows',
    },
};

function setLoading(value: boolean) {
    gridApi!.setGridOption('loading', value);
}

function onBtnClearRowData() {
    gridApi!.setGridOption('rowData', []);
}

function onBtnSetRowData() {
    gridApi!.setGridOption('rowData', [
        { athlete: 'Michael Phelps', country: 'US' },
        { athlete: 'Chris Hoy', country: 'UK' },
    ]);
}

function onBtnSetFilter() {
    onBtnSetRowData();
    gridApi!.setFilterModel({ country: { filterType: 'text', type: 'equals', filter: 'Spain' } });
}

function onBtnClearFilter() {
    gridApi!.setFilterModel(null);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
