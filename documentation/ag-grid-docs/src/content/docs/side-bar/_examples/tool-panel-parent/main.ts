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
    labelDefault: 'Popup',
    labelKey: 'columns',
    iconKey: 'columnsToolPanel',
    toolPanel: 'agColumnsToolPanel',
    toolPanelParams: { suppressRowGroups: true, suppressValues: true, suppressPivotMode: true },
    parent: document.querySelector('#popup .content'),
};
const filtersToolPanel: ToolPanelDef = {
    id: 'filters',
    labelDefault: 'Drawer',
    labelKey: 'filters',
    iconKey: 'filter',
    toolPanel: 'agFiltersToolPanel',
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
    sideBar: { toolPanels: [columnsToolPanel, filtersToolPanel], hideButtons: true, hiddenByDefault: true },
};

function closePopup() {
    const drawer = document.getElementById('popup');
    drawer.classList.toggle('active', false);
    gridApi.closeToolPanel();
}

function closeDrawer() {
    const drawer = document.getElementById('drawer');
    drawer.classList.toggle('active', false);
    gridApi.closeToolPanel();
}

function openPopup() {
    closeDrawer();
    const popup = document.getElementById('popup')!;
    popup.classList.toggle('active', true);
    gridApi.openToolPanel(columnsToolPanel.id);
    addStyles(popup);
}

function openDrawer() {
    closePopup();
    const drawer = document.getElementById('drawer')!;
    drawer.classList.toggle('active', true);
    gridApi.openToolPanel(filtersToolPanel.id, drawer.querySelector('.content'));
    addStyles(drawer);
}

function addStyles(parentEl: HTMLElement) {
    const contentClassnames = [...parentEl.querySelector('.content').classList].filter((e) => e !== 'content');
    parentEl.classList.add(...contentClassnames);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
