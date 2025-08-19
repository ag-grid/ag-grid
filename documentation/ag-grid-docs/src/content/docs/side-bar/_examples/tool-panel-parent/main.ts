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
const toolPanel: ToolPanelDef = {
    id: 'columns',
    labelDefault: 'Modal',
    labelKey: 'columns',
    iconKey: 'columnsToolPanel',
    toolPanel: 'agColumnsToolPanel',
    toolPanelParams: { suppressRowGroups: true, suppressValues: true, suppressPivotMode: true },
};

function passModal() {
    if (document.getElementById('modalDrawer')) {
        toggleDrawer();
        gridApi.openToolPanel(toolPanel.id);
        return;
    }
    const modalDrawer = document.createElement('div');
    modalDrawer.innerHTML = `
        <div class="inner ag-theme-params-1">
            <div><button onclick="toggleDrawer()">Close</button></div>
            <div class="content"></div>
        </div>
    `;
    modalDrawer.onclick = (e) => e.target === modalDrawer && toggleDrawer();
    modalDrawer.id = 'modalDrawer';
    modalDrawer.classList.add('modal', 'active');
    document.body.prepend(modalDrawer);
    const drawer = document.querySelector('#modalDrawer .content')!;
    gridApi.updateGridOptions({
        sideBar: {
            hideButtons: true,
            hiddenByDefault: true,
            toolPanels: [{ ...toolPanel, parent: drawer }] as ToolPanelDef[],
        },
    });
    gridApi.openToolPanel(toolPanel.id);
}

function toggleDrawer() {
    const drawer = document.getElementById('modalDrawer')!;
    drawer.classList.toggle('active');
    gridApi.closeToolPanel();
}

window.passModal = passModal;
window.toggleDrawer = toggleDrawer;

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
    sideBar: { toolPanels: [toolPanel], hideButtons: true, hiddenByDefault: true },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
