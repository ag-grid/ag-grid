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
    columnDefs: [{ field: 'athlete' }, { field: 'age' }, { field: 'country' }, { field: 'sport' }, { field: 'total' }],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: true,
    },
    sideBar: 'filters-new',
    enableFilterHandlers: true,
    initialState: {
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

function expandAgeAndCountry() {
    gridApi!.getToolPanelInstance('filters-new')!.expandFilters(['age', 'country']);
}

function collapseAge() {
    gridApi!.getToolPanelInstance('filters-new')!.collapseFilters(['age']);
}

function expandAll() {
    gridApi!.getToolPanelInstance('filters-new')!.expandFilters();
}

function collapseAll() {
    gridApi!.getToolPanelInstance('filters-new')!.collapseFilters();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
