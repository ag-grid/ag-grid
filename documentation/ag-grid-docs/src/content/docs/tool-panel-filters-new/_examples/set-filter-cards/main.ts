import type { GridApi, GridOptions } from 'ag-grid-community';
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

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete' },
        { field: 'age', filter: 'agNumberColumnFilter' },
        { field: 'country' },
        { field: 'year', filter: 'agNumberColumnFilter' },
        { field: 'total' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: true,
    },
    sideBar: 'filters-new',
    enableFilterHandlers: true,
    initialState: {
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
                    filters: [{ colId: 'athlete' }, { colId: 'age' }, { colId: 'country' }],
                },
            },
        },
    },
};

function showAthleteCountryYear() {
    gridApi!.getToolPanelInstance('filters-new')!.setFilterCards(['athlete', 'country', 'year']);
}

function reverseOrder() {
    const toolPanel = gridApi!.getToolPanelInstance('filters-new')!;
    const colIds = (toolPanel.getState().filters ?? []).map(({ colId }) => colId);
    toolPanel.setFilterCards(colIds.reverse());
}

function removeInactiveCards() {
    const toolPanel = gridApi!.getToolPanelInstance('filters-new')!;
    const colIds = (toolPanel.getState().filters ?? []).map(({ colId }) => colId);
    toolPanel.setFilterCards(colIds.filter((colId) => gridApi!.getColumnFilterModel(colId) != null));
}

function removeAllCards() {
    gridApi!.getToolPanelInstance('filters-new')!.setFilterCards([]);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
