import { ClientSideRowModelModule } from 'ag-grid-community';
import { GridApi, GridOptions, createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { FiltersToolPanelModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';
import { RowGroupingModule } from 'ag-grid-enterprise';
import { SetFilterModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    FiltersToolPanelModule,
    MenuModule,
    RowGroupingModule,
    SetFilterModule,
]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'country', rowGroup: true, filter: true },
        { field: 'sport', pivot: true, filter: true },
        { field: 'gold', aggFunc: 'sum' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
    },
    pivotMode: true,
    sideBar: 'filters',
    onGridReady: (params) => {
        const filtersToolPanel = params.api.getToolPanelInstance('filters');
        if (filtersToolPanel) {
            // expands 'year' and 'sport' filters in the Filters Tool Panel
            filtersToolPanel.expandFilters(['sport']);
        }
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
