import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnAutoSizeModule,
    ModuleRegistry,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';

ModuleRegistry.registerModules([
    ColumnAutoSizeModule,
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const columnDefs: ColDef[] = [
    { field: 'athlete', width: 150 },
    { field: 'age', width: 90 },
    { field: 'country', width: 120 },
    { field: 'year', width: 90 },
    { field: 'date', width: 110 },
    { field: 'sport', width: 110 },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    // The configured strategy is used when api.applyAutoSizeStrategy() is called with no arguments.
    autoSizeStrategy: {
        type: 'fitCellContents',
        defaultMinWidth: 80,
    },
};

// Re-apply the strategy configured on gridOptions. Useful from a ResizeObserver on the grid's
// container, after rows are refreshed, or any time layout inputs change.
function applyConfigured() {
    gridApi!.applyAutoSizeStrategy();
}

// Pass any strategy as an override — the grid option value is ignored for this call.
function applyFitCellContents() {
    gridApi!.applyAutoSizeStrategy({ type: 'fitCellContents', defaultMinWidth: 80 });
}

function applyFitGridWidth() {
    gridApi!.applyAutoSizeStrategy({ type: 'fitGridWidth', defaultMinWidth: 100 });
}

function applyFitProvidedWidth() {
    gridApi!.applyAutoSizeStrategy({ type: 'fitProvidedWidth', width: 600 });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
