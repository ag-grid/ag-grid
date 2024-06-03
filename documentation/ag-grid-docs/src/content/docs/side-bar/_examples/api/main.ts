import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
    GridApi,
    GridOptions,
    SideBarDef,
    ToolPanelSizeChangedEvent,
    ToolPanelVisibleChangedEvent,
    createGrid,
} from '@ag-grid-community/core';
import { CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';

ModuleRegistry.registerModules([
    CommunityFeaturesModule,
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    SetFilterModule,
]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete', filter: 'agTextColumnFilter', minWidth: 200 },
        { field: 'age' },
        { field: 'country', minWidth: 200 },
        { field: 'year' },
        { field: 'date', minWidth: 160 },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        // allow every column to be aggregated
        enableValue: true,
        // allow every column to be grouped
        enableRowGroup: true,
        // allow every column to be pivoted
        enablePivot: true,
        filter: true,
    },
    autoGroupColumnDef: {
        minWidth: 200,
    },
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
        ],
        defaultToolPanel: 'filters',
        hiddenByDefault: true,
    },
    onToolPanelVisibleChanged: (event: ToolPanelVisibleChangedEvent) => {
        console.log('toolPanelVisibleChanged', event);
    },
    onToolPanelSizeChanged: (event: ToolPanelSizeChangedEvent) => {
        console.log('toolPanelSizeChanged', event);
    },
};

function setSideBarVisible(value: boolean) {
    gridApi!.setSideBarVisible(value);
}

function isSideBarVisible() {
    alert(gridApi!.isSideBarVisible());
}

function openToolPanel(key: string) {
    gridApi!.openToolPanel(key);
}

function closeToolPanel() {
    gridApi!.closeToolPanel();
}

function getOpenedToolPanel() {
    alert(gridApi!.getOpenedToolPanel());
}

function setSideBar(def: SideBarDef | string | string[] | boolean) {
    gridApi!.setGridOption('sideBar', def);
}

function getSideBar() {
    var sideBar = gridApi!.getSideBar();
    alert(JSON.stringify(sideBar));
    console.log(sideBar);
}

function setSideBarPosition(position: 'left' | 'right') {
    gridApi!.setSideBarPosition(position);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
