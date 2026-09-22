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
        enableRowGroup: true,
    },
    rowGroupPanelShow: 'always',
    grandTotalRow: 'bottom',
};

let savedState: GridState | undefined;

function saveState() {
    savedState = gridApi.getState();
    console.log('Saved state', savedState);
}

function restoreState() {
    if (savedState) {
        gridApi.setState(savedState);
    }
}

function restoreStateKeepFilter() {
    if (savedState) {
        gridApi.setState(savedState, ['filter']);
    }
}

function setColumnOrderOnly() {
    // Every section this state omits is reset, not left as it is.
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
