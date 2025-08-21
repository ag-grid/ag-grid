import type { GridApi, GridOptions, ToolPanelDef } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { ColumnsToolPanelModule, FiltersToolPanelModule, PivotModule, SetFilterModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    NumberFilterModule,
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    SetFilterModule,
    PivotModule,
    TextFilterModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<IOlympicData>;
const columnsToolPanel: ToolPanelDef = {
    id: 'columns',
    labelDefault: 'Modal',
    labelKey: 'columns',
    iconKey: 'columnsToolPanel',
    toolPanel: 'agColumnsToolPanel',
    toolPanelParams: { suppressRowGroups: true, suppressValues: true, suppressPivotMode: true },
};

const gridOptions: GridOptions<IOlympicData> = {
    popupParent: document.body,
    columnDefs: [
        { field: 'athlete', filter: 'agTextColumnFilter', minWidth: 200 },
        { field: 'country', minWidth: 180 },
        { field: 'date', minWidth: 150 },
        { field: 'gold', minWidth: 150 },
        { field: 'silver', minWidth: 150 },
    ],
    defaultColDef: { flex: 1, minWidth: 100, filter: true },
    autoGroupColumnDef: { minWidth: 200 },
    sideBar: { toolPanels: [columnsToolPanel], hideButtons: true, hiddenByDefault: true },
};

function toggleDrawer() {
    const drawer = document.getElementById('modalDrawer')!;
    if (!drawer.classList.toggle('active')) {
        gridApi.closeToolPanel();
    }
}

function passModal(toolPanelId: string = columnsToolPanel.id) {
    const drawer = document.getElementById('modalDrawer')!;
    if (!drawer.classList.toggle('active')) {
        gridApi.closeToolPanel();
    }
    gridApi.openToolPanel(toolPanelId, drawer.querySelector<HTMLElement>('.content'));
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
