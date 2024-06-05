import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { FirstDataRenderedEvent, GridApi, GridOptions, IFiltersToolPanel, createGrid } from '@ag-grid-community/core';
import { CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';

ModuleRegistry.registerModules([
    CommunityFeaturesModule,
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    MenuModule,
    SetFilterModule,
]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        {
            headerName: 'Set Filter Column',
            field: 'col1',
            filter: 'agSetColumnFilter',
            flex: 1,
            editable: true,
        },
    ],
    sideBar: 'filters',
    rowData: getRowData(),
    onFirstDataRendered: onFirstDataRendered,
};

function getRowData() {
    return [{ col1: 'A' }, { col1: 'A' }, { col1: 'B' }, { col1: 'C' }];
}

function updateOne() {
    var newData = [{ col1: 'A' }, { col1: 'A' }, { col1: 'C' }, { col1: 'D' }, { col1: 'E' }];
    gridApi!.setGridOption('rowData', newData);
}

function updateTwo() {
    var newData = [
        { col1: 'A' },
        { col1: 'A' },
        { col1: 'B' },
        { col1: 'C' },
        { col1: 'D' },
        { col1: 'E' },
        { col1: 'B' },
        { col1: 'B' },
    ];
    gridApi!.setGridOption('rowData', newData);
}

function reset() {
    gridApi!.setFilterModel(null);
    gridApi!.setGridOption('rowData', getRowData());
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
    params.api.getToolPanelInstance('filters')!.expandFilters();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
