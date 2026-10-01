import type { FirstDataRenderedEvent, GridApi, GridOptions, GridState, GridStateKey } from 'ag-grid-community';
import { ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { savedStates } from './savedStates';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([AllEnterpriseModule]);

let gridApi: GridApi<IOlympicData>;
let defaultState: GridState | undefined;

const gridOptions: GridOptions<IOlympicData> = {
    gridId: 'savedViews',
    columnDefs: [
        { field: 'athlete', minWidth: 150 },
        { field: 'country', minWidth: 150 },
        { field: 'sport', minWidth: 150 },
        { field: 'year' },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: true,
        floatingFilter: true,
        enableRowGroup: true,
        enableValue: true,
    },
    autoGroupColumnDef: {
        minWidth: 200,
    },
    rowGroupPanelShow: 'always',
    sideBar: 'columns',
    onFirstDataRendered: onFirstDataRendered,
};

function onFirstDataRendered(event: FirstDataRenderedEvent<IOlympicData>) {
    // Capture the state before any view is applied, so the default view can be restored.
    defaultState = event.api.getState();
}

function applyDefaultView() {
    if (defaultState) {
        gridApi.setState(defaultState, getPropertiesToIgnore());
    }
}

function filterCountry() {
    gridApi.setFilterModel({
        country: { filterType: 'set', values: ['United States'] },
    });
}

// `propertiesToIgnore` lists the properties to leave untouched when the state is applied.
function getPropertiesToIgnore(): GridStateKey[] | undefined {
    const ignoreFilter = document.querySelector<HTMLInputElement>('#ignoreFilter')!.checked;
    return ignoreFilter ? ['filter'] : undefined;
}

function applyView(viewName: string) {
    const state = savedStates[viewName];
    gridApi.setState(state, getPropertiesToIgnore());
    console.log(`Applied view "${viewName}"`, state);
}

function setColumnOrderOnly() {
    // A sparse state: every property it omits is reset unless it is ignored.
    gridApi.setState(
        {
            columnOrder: {
                orderedColIds: ['total', 'gold', 'silver', 'bronze', 'athlete', 'country', 'sport', 'year'],
            },
        },
        getPropertiesToIgnore()
    );
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
