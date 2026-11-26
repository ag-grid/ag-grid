import type { GridApi, GridOptions, GridState, NewFiltersToolPanelState } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    GridStateModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ColumnMenuModule, ContextMenuModule, NewFiltersToolPanelModule, SetFilterModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    NumberFilterModule,
    ClientSideRowModelModule,
    NewFiltersToolPanelModule,
    ColumnMenuModule,
    ContextMenuModule,
    SetFilterModule,
    TextFilterModule,
    GridStateModule,
]);

let gridApi: GridApi<IOlympicData>;

const initialGridState: GridState = {
    filter: {
        filterModel: {
            age: { filterType: 'number', type: 'lessThan', filter: 25 },
            country: { filterType: 'set', values: ['United States', 'Russia'] },
        },
    },
    sideBar: {
        visible: true,
        position: 'right',
        openToolPanel: 'filters-new',
        toolPanels: {
            'filters-new': {
                filters: [{ colId: 'athlete' }, { colId: 'age' }, { colId: 'country', expanded: true }],
            } as NewFiltersToolPanelState,
        },
    },
};

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete' },
        { field: 'age', filter: 'agNumberColumnFilter' },
        { field: 'country' },
        { field: 'year', filter: 'agNumberColumnFilter' },
        { field: 'total', filter: 'agNumberColumnFilter' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: true,
    },
    sideBar: 'filters-new',
    enableFilterHandlers: true,
    initialState: initialGridState,
};

let savedState: GridState | undefined;

function showAthleteCountryYear() {
    gridApi!.getToolPanelInstance('filters-new')!.setFilterCards(['athlete', 'country', 'year']);
}

function expandAll() {
    gridApi!.getToolPanelInstance('filters-new')!.expandFilterCards();
}

function collapseAll() {
    gridApi!.getToolPanelInstance('filters-new')!.collapseFilterCards();
}

function clearFilterValues() {
    // The cards are part of the Side Bar state, not the filter model, so they stay in place
    gridApi!.setFilterModel(null);
}

function removeInactiveCards() {
    const toolPanel = gridApi!.getToolPanelInstance('filters-new')!;
    const colIds = (toolPanel.getState().filters ?? []).map(({ colId }) => colId);
    // When using Apply buttons, a card can have changes that have not been applied yet,
    // so also check the unapplied model to keep those cards
    toolPanel.setFilterCards(
        colIds.filter(
            (colId) =>
                gridApi!.getColumnFilterModel(colId) != null || gridApi!.getColumnFilterModel(colId, true) != null
        )
    );
}

function removeAllCards() {
    gridApi!.getToolPanelInstance('filters-new')!.setFilterCards([]);
}

// `setState` resets any section of the grid state it is not given, so the handlers below
// spread the current state to keep everything else (e.g. sorting) unchanged

function saveState() {
    savedState = gridApi!.getState();
    console.log('Saved state', savedState);
}

function restoreSavedState() {
    if (savedState) {
        // Restore the `filter` state as well as the `sideBar` state, to restore each card's values
        gridApi!.setState({ ...gridApi!.getState(), filter: savedState.filter, sideBar: savedState.sideBar });
        console.log('Restored state', savedState);
    }
}

function restoreInitialState() {
    gridApi!.setState({ ...gridApi!.getState(), filter: initialGridState.filter, sideBar: initialGridState.sideBar });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
