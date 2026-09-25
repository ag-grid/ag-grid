import type { FirstDataRenderedEvent, GridApi, GridOptions, SetFilterHandler } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import {
    ColumnMenuModule,
    FiltersToolPanelModule,
    NewFiltersToolPanelModule,
    SetFilterModule,
} from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    FiltersToolPanelModule,
    NewFiltersToolPanelModule,
    ColumnMenuModule,
    SetFilterModule,
]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        {
            headerName: 'Set Filter Column',
            field: 'col1',
            filter: 'agSetColumnFilter',
            filterParams: {
                preservePreviousValues: true,
            },
            floatingFilter: true,
            minWidth: 250,
        },
    ],
    enableFilterHandlers: true,
    sideBar: {
        toolPanels: [
            'filters',
            {
                id: 'filters-new',
                labelDefault: 'Filter Summaries',
                labelKey: 'filterSummaries',
                iconKey: 'filter',
                toolPanel: 'agNewFiltersToolPanel',
            },
        ],
        defaultToolPanel: 'filters',
    },
    rowData: getRowData(),
    onFirstDataRendered: onFirstDataRendered,
};

function getRowData() {
    return [{ col1: 'A' }, { col1: 'A' }, { col1: 'B' }, { col1: 'C' }];
}

function selectOnlyB() {
    gridApi!.setFilterModel({ col1: { filterType: 'set', values: ['B'] } });
}

function updateOne() {
    gridApi!.setGridOption('rowData', [{ col1: 'A' }, { col1: 'A' }, { col1: 'D' }]);
}

function updateTwo() {
    gridApi!.setGridOption('rowData', [{ col1: 'A' }, { col1: 'B' }, { col1: 'C' }, { col1: 'D' }]);
}

function clearPreservedValues() {
    gridApi!.getColumnFilterHandler<SetFilterHandler>('col1')!.clearPreservedValues();
}

function reset() {
    gridApi!.setFilterModel(null);
    gridApi!.setGridOption('rowData', getRowData());
    clearPreservedValues();
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
    params.api.getToolPanelInstance('filters')!.expandFilters();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
