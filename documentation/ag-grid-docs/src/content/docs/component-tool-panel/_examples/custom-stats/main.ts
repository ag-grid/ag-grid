import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CellValueChangedEvent, ColDef, GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';

import { CustomStatsToolPanel } from './customStatsToolPanel_typescript';

ModuleRegistry.registerModules([
    CommunityFeaturesModule,
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    SetFilterModule,
]);

const columnDefs: ColDef[] = [
    { field: 'athlete', width: 150, filter: 'agTextColumnFilter' },
    { field: 'age', width: 90 },
    { field: 'country', width: 120 },
    { field: 'year', width: 90 },
    { field: 'date', width: 110 },
    { field: 'gold', width: 100, filter: false },
    { field: 'silver', width: 100, filter: false },
    { field: 'bronze', width: 100, filter: false },
    { field: 'total', width: 100, filter: false },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    defaultColDef: {
        editable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
    },
    icons: {
        'custom-stats': '<span class="ag-icon ag-icon-custom-stats"></span>',
    },
    columnDefs: columnDefs,
    sideBar: {
        toolPanels: [
            {
                id: 'columns',
                labelDefault: 'Columns',
                labelKey: 'columns',
                iconKey: 'columns',
                toolPanel: 'agColumnsToolPanel',
            },
            {
                id: 'filters',
                labelDefault: 'Filters',
                labelKey: 'filters',
                iconKey: 'filter',
                toolPanel: 'agFiltersToolPanel',
            },
            {
                id: 'customStats',
                labelDefault: 'Custom Stats',
                labelKey: 'customStats',
                iconKey: 'custom-stats',
                toolPanel: CustomStatsToolPanel,
                toolPanelParams: {
                    title: 'Custom Stats',
                },
            },
        ],
        defaultToolPanel: 'customStats',
    },
    onCellValueChanged: (params: CellValueChangedEvent) => {
        params.api.refreshClientSideRowModel();
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data) => {
            gridApi!.setGridOption('rowData', data);
        });
});
