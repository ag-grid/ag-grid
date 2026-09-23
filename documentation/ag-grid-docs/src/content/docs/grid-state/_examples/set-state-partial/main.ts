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
    gridId: 'setStatePartial',
    columnDefs: [
        { field: 'athlete' },
        { field: 'country', pinned: 'left' },
        { field: 'year' },
        { field: 'sport', filter: 'agTextColumnFilter' },
        { field: 'gold', aggFunc: 'sum', sort: 'desc' },
        { field: 'silver', aggFunc: 'sum' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: true,
        floatingFilter: true,
    },
    grandTotalRow: 'bottom',
};

// A state saved earlier: Athlete pinned and sorted, Year hidden, medals summed.
const savedState: GridState = {
    columnOrder: {
        orderedColIds: ['athlete', 'country', 'sport', 'year', 'gold', 'silver'],
    },
    columnPinning: { leftColIds: ['athlete'], rightColIds: [] },
    columnVisibility: { hiddenColIds: ['year'] },
    sort: { sortModel: [{ colId: 'athlete', sort: 'asc' }] },
    aggregation: {
        aggregationModel: [
            { colId: 'gold', aggFunc: 'sum' },
            { colId: 'silver', aggFunc: 'sum' },
        ],
    },
};

function filterSwimming() {
    gridApi.setFilterModel({
        sport: { filterType: 'text', type: 'contains', filter: 'Swimming' },
    });
}

function restoreState() {
    gridApi.setState(savedState);
}

function restoreStateKeepFilter() {
    gridApi.setState(savedState, ['filter']);
}

function setColumnOrderOnly() {
    // A sparse state: every property it omits is reset, not left as it is.
    gridApi.setState({
        columnOrder: {
            orderedColIds: ['gold', 'silver', 'athlete', 'sport', 'country', 'year'],
        },
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
