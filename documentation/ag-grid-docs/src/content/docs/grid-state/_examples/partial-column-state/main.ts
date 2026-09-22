import type { GridApi, GridOptions, GridState } from 'ag-grid-community';
import { ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([AllEnterpriseModule]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    gridId: 'partialColumnState',
    columnDefs: [
        { field: 'athlete' },
        { field: 'country', pinned: 'left' },
        { field: 'year', hide: true },
        { field: 'sport' },
        { field: 'gold', aggFunc: 'sum' },
        { field: 'silver', aggFunc: 'sum' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    grandTotalRow: 'bottom',
};

// Only the column order is supplied; every other column state section is omitted.
const columnOrderState: GridState = {
    columnOrder: {
        orderedColIds: ['gold', 'silver', 'athlete', 'sport', 'country', 'year'],
    },
};

function recreateGrid(initialState?: GridState) {
    gridApi.destroy();

    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;

    gridOptions.initialState = initialState;
    console.log('Recreating grid with initialState', initialState);

    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi.setGridOption('rowData', data));
}

function recreateWithNoState() {
    recreateGrid();
}

function recreateWithColumnOrder() {
    recreateGrid(columnOrderState);
}

function recreateWithPartialColumnOrder() {
    recreateGrid({ ...columnOrderState, partialColumnState: true });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
