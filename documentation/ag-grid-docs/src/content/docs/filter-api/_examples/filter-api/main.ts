import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, GridApi, GridOptions, IFiltersToolPanel, ISetFilter, createGrid } from '@ag-grid-community/core';
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

const columnDefs: ColDef[] = [{ field: 'athlete', filter: 'agSetColumnFilter' }];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        filter: true,
    },
    sideBar: 'filters',
    onGridReady: (params) => {
        params.api.getToolPanelInstance('filters')!.expandFilters();
    },
};

let savedMiniFilterText: string | null = '';

function getMiniFilterText() {
    gridApi!.getColumnFilterInstance<ISetFilter>('athlete').then((athleteFilter) => {
        console.log(athleteFilter!.getMiniFilter());
    });
}

function saveMiniFilterText() {
    gridApi!.getColumnFilterInstance<ISetFilter>('athlete').then((athleteFilter) => {
        savedMiniFilterText = athleteFilter!.getMiniFilter();
    });
}

function restoreMiniFilterText() {
    gridApi!.getColumnFilterInstance<ISetFilter>('athlete').then((athleteFilter) => {
        athleteFilter!.setMiniFilter(savedMiniFilterText);
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
